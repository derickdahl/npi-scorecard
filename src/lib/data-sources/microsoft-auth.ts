// Configuration from environment variables
const CLIENT_ID = process.env.MICROSOFT_CLIENT_ID || '';
const TENANT_ID = process.env.MICROSOFT_TENANT_ID || '';
const REFRESH_TOKEN = process.env.MICROSOFT_REFRESH_TOKEN || '';

const SCOPES = 'Mail.Read Mail.Send Calendars.ReadWrite Chat.Read Files.Read.All User.Read offline_access';

let cachedToken: { accessToken: string; expiresAt: number } | null = null;

export function isConfigured(): boolean {
  const configured = !!(CLIENT_ID && TENANT_ID && REFRESH_TOKEN);
  console.log(`[Microsoft Auth] isConfigured: ${configured}, CLIENT_ID: ${CLIENT_ID ? 'set' : 'missing'}, TENANT_ID: ${TENANT_ID ? 'set' : 'missing'}, REFRESH_TOKEN: ${REFRESH_TOKEN ? 'set' : 'missing'}`);
  return configured;
}

export async function getAccessToken(): Promise<string> {
  if (!isConfigured()) {
    throw new Error('Microsoft Graph not configured. Set MICROSOFT_CLIENT_ID, MICROSOFT_TENANT_ID, and MICROSOFT_REFRESH_TOKEN');
  }

  // Check cached token
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60000) {
    console.log('[Microsoft Auth] Using cached token');
    return cachedToken.accessToken;
  }

  // Use direct OAuth2 refresh (matches the local msgraph.sh script)
  console.log('[Microsoft Auth] Refreshing token via OAuth2...');
  
  const tokenUrl = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;
  
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: CLIENT_ID,
    refresh_token: REFRESH_TOKEN,
    scope: SCOPES,
  });

  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    const data = await response.json();
    
    if (data.access_token) {
      console.log('[Microsoft Auth] Token refresh successful');
      cachedToken = {
        accessToken: data.access_token,
        expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
      };
      return data.access_token;
    } else {
      console.error('[Microsoft Auth] Token refresh failed:', data.error_description || data.error);
      throw new Error(`Token refresh failed: ${data.error_description || data.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('[Microsoft Auth] Token refresh error:', error);
    throw new Error(`Failed to refresh Microsoft token: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function graphCall(endpoint: string): Promise<any> {
  const token = await getAccessToken();
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `https://graph.microsoft.com/v1.0${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Graph API error ${response.status}: ${error}`);
  }

  return response.json();
}

// Helper to generate a refresh token (run locally once)
export async function generateAuthUrl(): Promise<string> {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: 'http://localhost:3000/api/auth/callback',
    scope: SCOPES,
    response_mode: 'query',
  });
  
  return `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/authorize?${params}`;
}
