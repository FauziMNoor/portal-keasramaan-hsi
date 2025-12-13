import { google } from 'googleapis';

// Initialize OAuth2 client
export function getOAuth2Client() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  return oauth2Client;
}

// Generate authorization URL
export function getAuthUrl() {
  const oauth2Client = getOAuth2Client();

  const scopes = [
    'https://www.googleapis.com/auth/drive', // Full Drive access (not just created files)
    'https://www.googleapis.com/auth/presentations',
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Get refresh token
    scope: scopes,
    prompt: 'consent', // Force consent screen to get refresh token
  });

  return url;
}

// Exchange authorization code for tokens
export async function getTokensFromCode(code: string) {
  const oauth2Client = getOAuth2Client();
  
  try {
    const { tokens } = await oauth2Client.getToken(code);
    return { success: true, tokens };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Get authenticated Google clients
export function getAuthenticatedClients(accessToken: string, refreshToken?: string) {
  const oauth2Client = getOAuth2Client();
  
  oauth2Client.setCredentials({
    access_token: accessToken,
    ...(refreshToken && { refresh_token: refreshToken }),
  });

  const slides = google.slides({ version: 'v1', auth: oauth2Client });
  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  return { slides, drive, oauth2Client };
}
