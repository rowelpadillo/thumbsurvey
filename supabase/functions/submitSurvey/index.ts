// supabase/functions/submitSurvey/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, authorization, x-client-info, apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { branch, rating, label, comment, ticketNum } = body;

    // ── Validate ───────────────────────────────────────────────────────────
    if (!branch || typeof branch !== "string") {
      return new Response(JSON.stringify({ error: "Missing branch" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!rating || ![1, 2, 3, 4].includes(Number(rating))) {
      return new Response(JSON.stringify({ error: "Invalid rating" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Read secrets ───────────────────────────────────────────────────────
    const APPSHEET_KEY    = Deno.env.get("APPSHEET_KEY")!;
    const APPSHEET_APP_ID = Deno.env.get("APPSHEET_APP_ID")!;
    const APPSHEET_TABLE  = Deno.env.get("APPSHEET_TABLE") ?? "main_survey";

    // ── Map rating number → is_satisfied value ─────────────────────────────
    // Adjust these values to match what your AppSheet Yes/No column expects
    //const isSatisfied = Number(rating) >= 3 ? "Yes" : "No";
    const isSatisfied = Number(rating) >= 3 ? 2 : 1;

    // ── Call AppSheet API ──────────────────────────────────────────────────
    const appsheetRes = await fetch(
      `https://api.appsheet.com/api/v2/apps/${APPSHEET_APP_ID}/tables/${APPSHEET_TABLE}/Action`,
      {
        method: "POST",
        headers: {
          "ApplicationAccessKey": APPSHEET_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Action: "Add",
          Properties: { Locale: "en-US" },
          Rows: [
            {
              // ── Matches your AppSheet column names exactly ──
              id:           crypto.randomUUID(),
              location:     branch,
              is_satisfied: isSatisfied,
              feedback:     comment?.trim() ?? "",
              ticket_num:   ticketNum?.trim() ?? "",
              survey_at: new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' }),
            },
          ],
        }),
      }
    );

    // ── Handle AppSheet response ───────────────────────────────────────────
    if (!appsheetRes.ok) {
      const errText = await appsheetRes.text();
      console.error("AppSheet error:", errText);
      return new Response(JSON.stringify({ error: "AppSheet rejected the request.", detail: errText }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await appsheetRes.json();
    console.log("AppSheet success:", result);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});