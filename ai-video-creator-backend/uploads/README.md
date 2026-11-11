# uploads/

Generated media storage (created automatically on server start):

- `voiceovers/` - MP3 files produced by the ElevenLabs voiceover generation
  (served publicly at `/uploads/voiceovers/<file>.mp3`)
- `exports/` - MP4 files produced by FFmpeg exports
  (served publicly at `/uploads/exports/<file>.mp4`)
- `tmp/` - temporary downloads and concat lists used while rendering exports

Generated files are git-ignored (see `.gitignore`). The `.gitkeep` files only
preserve the folder structure in version control.
