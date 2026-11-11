import { Link } from 'react-router-dom'
import styles from './Home.module.css'

const steps = [
  { number: '01', icon: '◎', title: 'Start with your voice', text: 'Record an idea or upload your audio. Every great story starts with a thought.' },
  { number: '02', icon: '≋', title: 'Find the right words', text: 'Turn your speech into a clear transcript, ready for your creative touch.' },
  { number: '03', icon: '▷', title: 'Bring it to life', text: 'Explore generated video options and choose the one that feels like you.' },
]

export const Home = () => (
  <div className={styles.page}>
    <header className={styles.header}>
      <Link className={styles.brand} to="/" aria-label="Frame home"><span className={styles.brandMark} aria-hidden="true">▶</span>frame<span className={styles.brandDot}>.</span></Link>
      <nav className={styles.nav} aria-label="Main navigation">
        <a className={styles.howLink} href="#how-it-works">How it works</a>
        <Link className={styles.login} to="/login">Sign in <span aria-hidden="true">↗</span></Link>
        <Link className={styles.primary} to="/signup">Create account <span aria-hidden="true">→</span></Link>
      </nav>
    </header>

    <main>
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}><span /> A LITTLE IDEA. ENDLESS POSSIBILITIES.</p>
          <h1 id="hero-title">Your voice.<br />Your story.<br /><span>In motion.</span></h1>
          <p className={styles.description}>Turn the ideas in your head into videos worth watching. Just speak, shape your story, and let Frame bring it to life.</p>
          <div className={styles.actions}>
            <a className={styles.secondary} href="#how-it-works"><span className={styles.playSmall} aria-hidden="true">▶</span> See how it works</a>
          </div>
          <p className={styles.heroNote}><span aria-hidden="true">✦</span> Your imagination is the only script you need.</p>
        </div>

        <div className={styles.visual} role="img" aria-label="Illustration of an audio idea becoming a cinematic mountain video">
          <div className={styles.orbit} />
          <div className={styles.videoCard}>
            <div className={styles.landscape}><div className={styles.sun} /><div className={styles.mountainBack} /><div className={styles.mountainFront} /><div className={styles.landscapeGlow} /></div>
            <div className={styles.videoTop}><span><i /> YOUR NEXT BIG IDEA</span><span>✦ AI VIDEO</span></div>
            <div className={styles.videoTitle}>Some stories<br />are meant to move.</div>
            <div className={styles.videoBottom}><span className={styles.previewPlay}>▶</span><span className={styles.progress}><i /></span><span>00:12 / 00:30</span></div>
          </div>
          <div className={styles.voiceCard}><span className={styles.mic} aria-hidden="true">◉</span><div><span className={styles.smallLabel}>IT STARTS WITH YOU</span><div className={styles.wave}>{Array.from({ length: 25 }, (_, i) => <span key={i} style={{ height: `${12 + ((i * 13) % 29)}px`, animationDelay: `${i * .07}s` }} />)}</div></div><span className={styles.voiceTime}>0:08</span></div>
          <div className={styles.readyCard}><span className={styles.check}>✓</span><div><strong>Idea, meet reality.</strong><span>Your next story is taking shape.</span></div><span aria-hidden="true">✦</span></div>
          <span className={styles.sparkle} aria-hidden="true">✳</span>
          <p className={styles.visualCaption}>FROM “WHAT IF” TO “WATCH THIS” <span>↗</span></p>
        </div>
      </section>

      <section className={styles.process} id="how-it-works" aria-labelledby="process-title">
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>LESS PROCESS. MORE POSSIBILITY.</p><h2 id="process-title">Big ideas. Three simple steps.</h2></div><p>From a spark of inspiration<br />to something you can share.</p></div>
        <div className={styles.steps}>{steps.map(step => <article className={styles.step} key={step.number}><div className={styles.stepTop}><span className={styles.stepIcon} aria-hidden="true">{step.icon}</span><span>{step.number}</span></div><h3>{step.title}</h3><p>{step.text}</p></article>)}</div>
      </section>
    </main>
    <footer className={styles.footer}><span>frame. <span>Make something worth watching.</span></span><Link to="/signup">Your story starts here ↗</Link></footer>
  </div>
)
