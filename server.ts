import { serve } from "https://deno.land/std@0.142.0/http/server.ts";

async function handler(req: Request): Promise<Response> {
    switch (req.method) {
        case "POST": {
            const body = await req.formData();
            const name = body.get("name") || "anonymous";
            const message = body.get("message");
            //return new Response(`Hello ${name}!`);

            const data = {
                message: "sent!",
            };

            const response = JSON.stringify(data, null, 2);

            return new Response(response, {
                headers: { "content-type": "application/json; charset=utf-8" },
            });
        }

        default:
            return new Response("Invalid method", {
                status: 405,
                headers: { "content-type": "application/json; charset=utf-8" },
            });
    }
}

serve(handler);

