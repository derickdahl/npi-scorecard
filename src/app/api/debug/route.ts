import { NextResponse } from 'next/server';
import { isConfigured, getAccessToken } from '@/lib/data-sources/microsoft-auth';

export async function GET() {
  const debug: Record<string, any> = {
    env: {
      MICROSOFT_CLIENT_ID: process.env.MICROSOFT_CLIENT_ID ? 'set' : 'missing',
      MICROSOFT_TENANT_ID: process.env.MICROSOFT_TENANT_ID ? 'set' : 'missing',
      MICROSOFT_REFRESH_TOKEN: process.env.MICROSOFT_REFRESH_TOKEN ? `set (${process.env.MICROSOFT_REFRESH_TOKEN?.length} chars)` : 'missing',
      MICROSOFT_CLIENT_SECRET: process.env.MICROSOFT_CLIENT_SECRET ? 'set' : 'missing',
      SLACK_TOKEN: process.env.SLACK_TOKEN ? `set (${process.env.SLACK_TOKEN?.length} chars)` : 'missing',
    },
    microsoft: {
      isConfigured: false,
      tokenTest: null,
      error: null,
    },
    slack: {
      tokenTest: null,
      error: null,
    },
  };

  // Test Microsoft
  try {
    debug.microsoft.isConfigured = isConfigured();
    if (debug.microsoft.isConfigured) {
      const token = await getAccessToken();
      debug.microsoft.tokenTest = token ? `success (${token.length} chars)` : 'failed';
    }
  } catch (error) {
    debug.microsoft.error = error instanceof Error ? error.message : String(error);
  }

  // Test Slack
  if (process.env.SLACK_TOKEN) {
    try {
      const response = await fetch('https://slack.com/api/auth.test', {
        headers: {
          'Authorization': `Bearer ${process.env.SLACK_TOKEN}`,
        },
      });
      const data = await response.json();
      debug.slack.tokenTest = data.ok ? `success (user: ${data.user}, team: ${data.team})` : `failed: ${data.error}`;
    } catch (error) {
      debug.slack.error = error instanceof Error ? error.message : String(error);
    }
  }

  return NextResponse.json(debug);
}
