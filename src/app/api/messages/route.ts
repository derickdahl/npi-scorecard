import { NextResponse } from 'next/server';
import { getAllMessages, calculateMetrics, getSummaryMetrics } from '@/lib/data-sources';
import { classifyMessages, ClassificationResult } from '@/lib/data-sources/message-classifier';

export async function GET(request: Request) {
  try {
    console.log('📬 Fetching unified messages...');
    const startTime = Date.now();
    
    // Get all messages from all sources
    const messages = await getAllMessages();
    
    // Classify messages (needs response?)
    console.log('🤖 Classifying messages...');
    const classifications = await classifyMessages(messages);
    
    // Add classification to each message
    const classifiedMessages = messages.map(msg => ({
      ...msg,
      classification: classifications.get(msg.id) || {
        requires_response: 'maybe' as const,
        confidence: 'low' as const,
        reason: 'Not classified',
        method: 'rule' as const,
      },
    }));
    
    // Calculate metrics
    const sourceMetrics = calculateMetrics(messages);
    const summaryMetrics = getSummaryMetrics(messages);
    
    // Add classification summary
    const classificationSummary = {
      needs_response: classifiedMessages.filter(m => m.classification.requires_response === 'yes').length,
      no_response: classifiedMessages.filter(m => m.classification.requires_response === 'no').length,
      maybe: classifiedMessages.filter(m => m.classification.requires_response === 'maybe').length,
      by_method: {
        rule: classifiedMessages.filter(m => m.classification.method === 'rule').length,
        llm: classifiedMessages.filter(m => m.classification.method === 'llm').length,
      },
    };
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ Unified messages API response ready in ${duration}ms`);
    console.log(`📊 Summary: ${messages.length} messages, ${summaryMetrics.pendingMessages} pending`);

    return NextResponse.json({
      messages: classifiedMessages,
      sourceMetrics,
      summaryMetrics,
      classificationSummary,
      meta: {
        total: classifiedMessages.length,
        fetchedAt: new Date().toISOString(),
        duration: `${duration}ms`,
        sources: {
          microsoft: classifiedMessages.filter(m => ['email_work', 'teams_mention', 'teams_dm'].includes(m.source)).length,
          slack: classifiedMessages.filter(m => m.source === 'slack').length,
          imessage: classifiedMessages.filter(m => m.source === 'imessage').length,
          apple_mail: classifiedMessages.filter(m => m.source === 'email_personal').length,
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Unified messages API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch messages',
        details: error instanceof Error ? error.message : 'Unknown error',
        messages: [],
        sourceMetrics: [],
        summaryMetrics: {
          totalMessages: 0,
          pendingMessages: 0,
          respondedMessages: 0,
          avgResponseTime: 0,
          responseRate: 0,
          under30MinCount: 0,
          under2HoursCount: 0,
          over2HoursCount: 0,
        }
      },
      { status: 500 }
    );
  }
}

// Enable CORS for development
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}