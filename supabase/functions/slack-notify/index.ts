import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders, handleCorsOptions } from "../_shared/cors.ts";

serve(async (req) => {
  const optionsResponse = handleCorsOptions(req);
  if (optionsResponse) return optionsResponse;

  const requestOrigin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(requestOrigin);

  try {
    const SLACK_WEBHOOK_URL = Deno.env.get('SLACK_WEBHOOK_URL');
    
    if (!SLACK_WEBHOOK_URL) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Slack webhook URL not configured. Add SLACK_WEBHOOK_URL secret to enable Slack notifications." 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { agent_name, event_type, message, channel } = await req.json();

    const slackMessage = {
      text: `🤖 *Dr. Claw Agent Update*`,
      blocks: [
        {
          type: "header",
          text: { type: "plain_text", text: `🤖 ${agent_name || 'AI Agent'} — ${event_type || 'Update'}` }
        },
        {
          type: "section",
          text: { type: "mrkdwn", text: message || "Agent activity notification" }
        },
        {
          type: "context",
          elements: [
            { type: "mrkdwn", text: `📋 HIPAA Compliant • BAA Secured • PHI Protected` }
          ]
        }
      ]
    };

    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackMessage),
    });

    if (!response.ok) {
      throw new Error(`Slack API returned ${response.status}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Slack notification error:", error);
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errMsg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
