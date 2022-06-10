import { serve } from "https://deno.land/std@0.142.0/http/server.ts";

async function handler(req: Request): Promise<Response> {
    const allowed_origin = env.get("ALLOWED_ORIGIN");
    const email_to = env.get("EMAIL_TO");

    switch (req.method) {
        case "POST": {
            const body = await req.formData();
            const name = body.get("name") || "anonymous";
            const message = body.get("message");
            //return new Response(`Hello ${name}!`);

            const data = {
                message: "sent!",
                r: req,
                a: allowed_origin,
                e: email_to
            };
            
            const response = JSON.stringify(data, null, 2);

            return new Response(response, {
                headers: { "content-type": "application/json; charset=utf-8" },
            });
        }

        default:
            const data = {
                message: "Invalid method",
                a: allowed_origin,
                e: email_to
            };
            return new Response(JSON.stringify(data, null, 2), {
                status: 405,
                headers: { "content-type": "application/json; charset=utf-8" },
            });
    }
}

serve(handler);

