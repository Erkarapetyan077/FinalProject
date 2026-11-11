/**
 * Central catalogue of reusable API error messages.
 *
 * Every error surfaced by the API MUST reference one of these constants so the
 * wording stays consistent across validators, services, controllers and the
 * Swagger documentation. Do NOT hardcode user-facing error strings elsewhere.
 */
export const ERROR_MESSAGES = {
  // ---- Generic ----
  INTERNAL_SERVER_ERROR:
    'Internal server error. Please try again later.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_FAILED:
    'Validation failed. Please check the errors field for details.',
  INVALID_JSON: 'Request body is not valid JSON.',
  TOO_MANY_REQUESTS:
    'Too many requests from this IP address. Please slow down and try again later.',

  // ---- Authentication ----
  AUTH_REQUIRED:
    'Authentication required. Send a Bearer token in the Authorization header.',
  TOKEN_INVALID: 'Invalid or expired authentication token.',
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_IN_USE: 'A user with this email already exists.',
  USER_NOT_FOUND: 'Authenticated user no longer exists.',
  JWT_SECRET_MISSING: 'JWT_SECRET is not configured on the server.',

  // ---- Projects ----
  PROJECT_NOT_FOUND: 'Project not found, or it does not belong to you.',

  // ---- Videos ----
  VIDEO_NOT_FOUND: 'Video not found, or it does not belong to this project.',
  PEXELS_MOCK_NOTICE:
    'PEXELS_API_KEY is not configured on this server, so this is clearly-flagged development mock data. Add a Pexels API key to .env to search real stock videos.',
  PEXELS_REQUEST_FAILED:
    'The request to the Pexels stock video service failed. Please try again later.',
  INVALID_VIDEO_URL: 'videoUrl must be a valid http(s) URL.',

  // ---- Voiceovers ----
  VOICEOVER_NOT_FOUND:
    'Voiceover not found, or it does not belong to this project.',
  VOICEOVER_NOT_CONFIGURED:
    'Voiceover audio generation is not configured on this server. Set ELEVENLABS_API_KEY (and optionally ELEVENLABS_VOICE_ID) in .env and restart the server.',
  VOICEOVER_GENERATION_FAILED:
    'Voiceover audio generation failed while contacting the provider.',
  VOICEOVER_AUDIO_FILE_MISSING:
    'Generated audio file could not be stored on the server.',

  // ---- Captions ----
  CAPTION_NOT_FOUND:
    'Caption not found, or it does not belong to this project.',
  CAPTION_TIME_RANGE_INVALID: 'endTime must be greater than startTime.',

  // ---- Exports ----
  EXPORT_NOT_FOUND:
    'Export not found, or it does not belong to this project.',
  FFMPEG_NOT_AVAILABLE:
    'FFmpeg is not available on the server, so video export is disabled. Install FFmpeg (for example "sudo apt install ffmpeg" on Debian/Ubuntu or "brew install ffmpeg" on macOS) and restart the server.',
  EXPORT_FAILED: 'Video export failed while processing.',
};
