// @ts-nocheck
// 支持本地化配置：优先读取环境变量 `AI_BASE_URL` 和 `AI_SERVICE_KEY`

const MEOO_AI_BASE_URL = Deno.env.get('AI_BASE_URL') || 'https://api.meoo.host';
const MEOO_PROJECT_SERVICE_AK = Deno.env.get('AI_SERVICE_KEY') || Deno.env.get('MEOO_PROJECT_API_KEY') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // CORS 预检
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const messages = body.messages || [];
    const model = body.model || 'qwen3.6-plus';

    // 调用 Meoo AI（强制流式）
    const response = await fetch(
      `${MEOO_AI_BASE_URL}/meoo-ai/compatible-mode/v1/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MEOO_PROJECT_SERVICE_AK}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model, messages, stream: true }),
      }
    );

    // 转发上游 HTTP 状态码，不吞掉 4xx/5xx
    if (!response.ok) {
      const errorBody = await response.text();
      return new Response(errorBody, {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 转发 SSE 流
    const reader = response.body!.getReader();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal Server Error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
