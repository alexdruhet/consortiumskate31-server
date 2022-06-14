import { serve } from "https://deno.land/std@0.142.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp/mod.ts";
import "https://deno.land/x/dotenv/load.ts";


async function handler(req: Request): Promise<Response> {
    const { ALLOWED_ORIGIN, EMAIL_TO, PASSWORD } = Deno.env.toObject();
    const responseHeaders = {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": `${ALLOWED_ORIGIN}`,
        "Vary": "Origin"
    };

    console.log(req.Request);

    if (!req.origin || (ALLOWED_ORIGIN !== '*' && req.origin !== ALLOWED_ORIGIN)) {
        const data = {
            message: "Forbidden access"
        };
        return new Response(JSON.stringify(data, null, 2), {
            status: 403,
            headers: responseHeaders,
        });
    }

    switch (req.method) {
        case "POST": {
            const body = await req.formData();
            const emailFrom = body.get("email") || EMAIL_TO;
            const name = body.get("name") || "anonymous";
            const message = body.get("message") || "test";

            const client = new SmtpClient();
            const connectConfig: any = {
                hostname: "smtp.gmail.com",
                port: 465,
                username: EMAIL_TO,
                password: PASSWORD,
            };
            //await client.connectTLS(connectConfig);

            //await client.send({
            //    from: emailFrom,
            //    to: EMAIL_TO,
            //    subject: `[${ALLOWED_ORIGIN}] message de ${name}`,
            //    content: message,
            //});

            //await client.close();

            const data = {
                message: "sent!"
            };

            const response = JSON.stringify(data, null, 2);

            return new Response(response, {
                headers: responseHeaders,
            });
        }

        default:
            const data = {
                message: "Invalid method"
            };
            return new Response(JSON.stringify(data, null, 2), {
                status: 405,
                headers: responseHeaders,
            });
    }
}

serve(handler);

