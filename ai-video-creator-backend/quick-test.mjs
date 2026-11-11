// quick-test.mjs — Արագ ստուգում (14 քայլ) AI Video Creator API-ի համար
// Գործարկում՝
//   Տերմինալ 1:  npm run dev          (սերվերը միացրած պահիր)
//   Տերմինալ 2:  node quick-test.mjs
// Պահանջվում է Node.js 18+

const BASE = process.env.BASE_URL || 'http://localhost:5000';

let passed = 0;
let failed = 0;

function ok(name, cond, detail = '') {
  if (cond) {
    passed += 1;
    console.log(`  ✅ ${name}${detail ? ' — ' + detail : ''}`);
  } else {
    failed += 1;
    console.log(`  ❌ ${name}${detail ? ' — ' + detail : ''}`);
  }
}

async function api(method, path, { token, body } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try { json = await res.json(); } catch { /* non-JSON response */ }
  return { status: res.status, json };
}

(async () => {
  console.log(`Թեստավորում եմ՝ ${BASE}\n`);

  // 1) Health check
  let r = await api('GET', '/api/health');
  ok('health — ONLINE', r.status === 200 && r.json?.data?.status === 'ok', `db: ${r.json?.data?.database}`);

  // 2) Register -> token
  const email = `aram${Date.now()}@test.com`;
  r = await api('POST', '/api/auth/register', {
    body: { name: 'Aram', email, password: 'Test1234!' },
  });
  const token = r.json?.data?.token || '';
  ok('register → token', r.status === 201 && token.length > 20);

  // 3) Login
  r = await api('POST', '/api/auth/login', {
    body: { email, password: 'Test1234!' },
  });
  ok('login', r.status === 200 && (r.json?.data?.token || '').length > 20);

  // 4) Profile (me)
  r = await api('GET', '/api/auth/me', { token });
  ok('profile (me)', r.status === 200 && r.json?.data?.user?.name === 'Aram', `ողջույն, ${r.json?.data?.user?.name}!`);

  // 5) Առանց token-ի -> 401
  r = await api('GET', '/api/projects');
  ok('առանց token-ի → 401', r.status === 401);

  // 6) Project ստեղծում
  r = await api('POST', '/api/projects', {
    token,
    body: { title: 'Իմ առաջին տեսանյութը', topic: 'ocean nature' },
  });
  const projectId = r.json?.data?.project?.id || '';
  ok('project ստեղծում', r.status === 201 && projectId.length > 10, projectId);

  // 7) Projects ցուցակ + pagination
  r = await api('GET', '/api/projects?page=1&limit=10', { token });
  ok('projects ցուցակ + pagination', r.status === 200 && Array.isArray(r.json?.data?.items), `ընդհանուր՝ ${r.json?.data?.pagination?.total}`);

  // 8) Video search (Pexels, key չկա → mock)
  r = await api('GET', '/api/videos/search?query=ocean', { token });
  const videos = r.json?.data?.videos || [];
  ok('video search (mock)', r.status === 200 && videos.length > 0, `${videos.length} արդյունք (mock=${r.json?.data?.mock})`);

  // 9) Video-ն կցել project-ին
  const v0 = videos[0] || {};
  r = await api('POST', `/api/projects/${projectId}/videos`, {
    token,
    body: {
      videoUrl: v0.videoUrl || 'https://example.com/clip.mp4',
      thumbnailUrl: v0.thumbnailUrl,
      provider: v0.provider || 'pexels',
      externalVideoId: v0.externalVideoId || 'test-1',
      duration: v0.duration || 10,
      width: v0.width || 1280,
      height: v0.height || 720,
    },
  });
  ok('video-ն կցել project-ին', r.status === 201 && !!r.json?.data?.video?.id, r.json?.data?.video?.id || '');

  // 10) Voiceover տեքստ (draft)
  r = await api('POST', `/api/projects/${projectId}/voiceovers`, {
    token,
    body: { text: 'Բարև՛, սա ձայնագրության տեքստ է։' },
  });
  const voiceoverId = r.json?.data?.voiceover?.id || '';
  ok('voiceover տեքստ', r.status === 201 && r.json?.data?.voiceover?.status === 'draft');

  // 11) Voiceover generate — ՃԻՇՏ նեստավ հասցեն
  //     /api/projects/{projectId}/voiceovers/{voiceoverId}/generate
  //     Key չկա → 503 (գեղեցիկ ձախողում, տեքստը չի կորչում)
  r = await api('POST', `/api/projects/${projectId}/voiceovers/${voiceoverId}/generate`, { token });
  ok(
    'voiceover generate (key չկա → 503 = նորմալ)',
    r.status === 503 && (r.json?.message || '').includes('ELEVENLABS_API_KEY'),
    `status ${r.status}`
  );

  // 12) Caption ստեղծում
  r = await api('POST', `/api/projects/${projectId}/captions`, {
    token,
    body: { text: 'Բարի գալուստ։', startTime: 0, endTime: 3.5 },
  });
  ok('caption ստեղծում', r.status === 201 && !!r.json?.data?.caption?.id);

  // 13) Caption վատ ժամանակ (endTime <= startTime) -> 422
  r = await api('POST', `/api/projects/${projectId}/captions`, {
    token,
    body: { text: 'վատ ժամանակ', startTime: 5, endTime: 2 },
  });
  ok('caption վատ ժամանակ → 422', r.status === 422, `status ${r.status}`);

  // 14) Export (FFmpeg)
  //     FFmpeg տեղադրված չէ → 503 (նորմալ) | տեղադրված է → 201 (աշխատանք ստեղծվեց)
  r = await api('POST', `/api/projects/${projectId}/exports`, { token });
  const noFfmpeg = r.status === 503;
  const created = r.status === 201;
  ok(
    'export (FFmpeg)',
    noFfmpeg || created,
    noFfmpeg ? 'FFmpeg տեղադրված չէ → 503 (նորմալ)' : 'export աշխատանքը ստեղծվեց → 201'
  );

  console.log('');
  if (failed === 0) {
    console.log(`ԱՐԴՅՈՒՆՔ՝ ${passed} ✅ / 0 ❌ — Ամեն ինչ հիանալի է աշխատում! 🎉`);
  } else {
    console.log(`ԱՐԴՅՈՒՆՔ՝ ${passed} ✅ / ${failed} ❌`);
  }
  process.exit(failed === 0 ? 0 : 1);
})().catch((err) => {
  console.error('\nՍերվերին կապվել չհաջողվեց:', err.message);
  console.error('Համոզվիր, որ մեկ այլ տերմինալում աշխատում է՝ npm run dev');
  process.exit(1);
});
