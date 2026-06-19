// // supabase/functions/getBanner/index.ts

// import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Headers": "content-type, authorization, apikey",
//   "Access-Control-Allow-Methods": "GET, OPTIONS",
// };

// serve(async (req: Request) => {
//   if (req.method === "OPTIONS") {
//     return new Response("ok", { headers: corsHeaders });
//   }

//   try {
//     const APPSHEET_KEY    = Deno.env.get("APPSHEET_KEY")!;
//     const APPSHEET_APP_ID = Deno.env.get("APPSHEET_APP_ID")!;

//     const res = await fetch(
//       `https://api.appsheet.com/api/v2/apps/${APPSHEET_APP_ID}/tables/banners/Action`,
//       {
//         method: "POST",
//         headers: {
//           "ApplicationAccessKey": APPSHEET_KEY,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           Action: "Find",
//           Properties: { Locale: "en-US" },
//           Rows: [],
//         }),
//       }
//     );

//     const data = await res.json();
//     const rows: any[] = data?.Rows ?? [];
//     const active = rows.find((r) => r.is_active === "Y" || r.is_active === true);

//     return new Response(JSON.stringify({ banner: active ?? null }), {
//       status: 200,
//       headers: { ...corsHeaders, "Content-Type": "application/json" },
//     });

//   } catch (err) {
//     console.error("getBanner error:", err);
//     return new Response(JSON.stringify({ banner: null }), {
//       status: 200, // return 200 so the app doesn't break if banner fails
//       headers: { ...corsHeaders, "Content-Type": "application/json" },
//     });
//   }
// });

// supabase/functions/getBanner/index.ts

// import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Headers": "content-type, authorization, apikey",
//   "Access-Control-Allow-Methods": "GET, OPTIONS",
// };

// serve(async (req: Request) => {
//   if (req.method === "OPTIONS") {
//     return new Response("ok", { headers: corsHeaders });
//   }

//   try {
//     const APPSHEET_KEY    = Deno.env.get("APPSHEET_KEY")!;
//     const APPSHEET_APP_ID = Deno.env.get("APPSHEET_APP_ID")!;

//     const res = await fetch(
//       `https://api.appsheet.com/api/v2/apps/${APPSHEET_APP_ID}/tables/banners/Action`,
//       {
//         method: "POST",
//         headers: {
//           "ApplicationAccessKey": APPSHEET_KEY,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           Action: "Find",
//           Properties: { Locale: "en-US" },
//           Rows: [],
//         }),
//       }
//     );

//     const data = await res.json();
    
//     // THE FIX: Check if data is an array directly, otherwise look for data.Rows
//     const rows: any[] = Array.isArray(data) ? data : (data?.Rows ?? []);
    
//     // Find the active banner
//     //const active = rows.find((r) => r.is_active === "Y" || r.is_active === true);
//     const activeBanners = rows.filter((r) => r.is_active === "Y" || r.is_active === true);

//     // Return the correct output for your app
//     // return new Response(JSON.stringify({ banner: active ?? null }), {
//     return new Response(JSON.stringify({ banners: activeBanners }), {
//       status: 200,
//       headers: { ...corsHeaders, "Content-Type": "application/json" },
//     });

//   } catch (err) {
//     console.error("getBanner error:", err);
//     return new Response(JSON.stringify({ banners: null }), {
//       status: 200, // return 200 so the app doesn't break if banner fails
//       headers: { ...corsHeaders, "Content-Type": "application/json" },
//     });
//   }
// });


// test auth


import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, authorization, apikey",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

serve(async (req: Request) => {
  // 1. Handle CORS preflight requests from the browser
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // 2. THE SECURITY CHECK: Look for the Authorization header
  const authHeader = req.headers.get("Authorization");
  
  if (!authHeader) {
    // If there is no auth header (e.g., someone pasted the URL in their browser)
    return new Response(
      JSON.stringify({ error: "Unauthorized access. Please use the app." }),
      { 
        status: 401, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }

  // 3. If they pass the check, run your normal AppSheet logic
  try {
    const APPSHEET_KEY    = Deno.env.get("APPSHEET_KEY")!;
    const APPSHEET_APP_ID = Deno.env.get("APPSHEET_APP_ID")!;

    const res = await fetch(
      `https://api.appsheet.com/api/v2/apps/${APPSHEET_APP_ID}/tables/banners/Action`,
      {
        method: "POST",
        headers: {
          "ApplicationAccessKey": APPSHEET_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Action: "Find",
          Properties: { Locale: "en-US" },
          Rows: [],
        }),
      }
    );

    const data = await res.json();
    
    // Check if data is an array directly, otherwise look for data.Rows
    const rows: any[] = Array.isArray(data) ? data : (data?.Rows ?? []);
    
    // Find the active banners
    const activeBanners = rows.filter((r) => r.is_active === "Y" || r.is_active === true);

    // Return the correct output for your app
    return new Response(JSON.stringify({ banners: activeBanners }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("getBanner error:", err);
    return new Response(JSON.stringify({ banners: null }), {
      status: 200, // return 200 so the app doesn't break if banner fails
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});