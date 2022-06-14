import { serve } from "https://deno.land/std@0.142.0/http/server.ts";
import "https://deno.land/x/dotenv/load.ts";
import { sendMail, IRequestBody } from "https://deno.land/x/sendgrid/mod.ts";
import { email } from "https://deno.land/x/validation/mod.ts";


async function handler(req: Request): Promise<Response> {
    const { ALLOWED_ORIGIN, EMAIL_TO, NAME_TO, SENDGRID_API_KEY } = Deno.env.toObject();
    const responseHeaders = {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": `${ALLOWED_ORIGIN}`,
        "Vary": "Origin"
    };

    console.log(req.headers.get("origin"), ALLOWED_ORIGIN, req.headers);

    if (
        !req.headers.has("origin")
        || (
            ALLOWED_ORIGIN !== "*"
            && req.headers.get("origin") !== ALLOWED_ORIGIN
        )
    ) {
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
            let hasError = false;
            let errors = [];
            const body = await req.formData();
            console.log(body.entries());

            const emailFrom = body.get("email");
            if (!email.valid(emailFrom)) {
                hasError = true;
                errors['email'] = 'invalid email';
                console.error(errors['email']);
            }
            const subject = `[Web Contact] message de ${emailFrom}`
            const name = body.get("name");
            if (!name) {
                hasError = true;
                errors['name'] = 'empty name';
                console.error(errors['name']);
            }
            const message = body.get("message");
            if (!message) {
                hasError = true;
                errors['message'] = 'empty message';
                console.error(errors['message']);
            }

            if (hasError) {
                const response = JSON.stringify(errors, null, 2);

                return new Response(response, {
                    status: 400,
                    headers: responseHeaders,
                });
            }

            let mail: IRequestBody = {
                personalizations: [
                    {
                        subject: `${subject}`,
                        to: [{ name: NAME_TO, email: EMAIL_TO }],
                    },
                ],
                from: { name: `${name}`, email: `${emailFrom}` },
                content: [
                    { type: "text/plain", value: `${message}` },
                ],
            };

            let sendGridResponse = await sendMail(mail, { apiKey: SENDGRID_API_KEY });

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

