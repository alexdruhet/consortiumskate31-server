import { serve } from "https://deno.land/std@0.142.0/http/server.ts";
import "https://deno.land/x/dotenv/load.ts";
import { IRequestBody, sendMail } from "https://deno.land/x/sendgrid/mod.ts";
import { email } from "https://deno.land/x/validation/mod.ts";

async function handler(req: Request): Promise<Response> {
    const {
        ALLOWED_ORIGIN,
        EMAIL_TO,
        NAME_TO,
        SENDGRID_API_KEY
    } = Deno.env.toObject();
    const responseHeaders = {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": `${ALLOWED_ORIGIN}`,
        "Vary": "Origin",
    };

    if (
        !req.headers.has("origin") ||
        (
            ALLOWED_ORIGIN !== "*" &&
            req.headers.get("origin") !== ALLOWED_ORIGIN
        )
    ) {
        const data = {
            message: "Forbidden access",
        };
        return new Response(JSON.stringify(data, null, 2), {
            status: 403,
            headers: responseHeaders,
        });
    }

    switch (req.method) {
        case "POST": {
            let hasError: boolean = false;
            let errors = { "email": "", "name": "", "message": "" };

            const body: FormData = await req.formData();

            const emailFrom: FormDataEntryValue | string = body.get("email_from") || "";
            if (!email.valid(emailFrom.toString())) {
                hasError = true;
                errors.email = "invalid email";
                console.error(errors.email);
            }

            const subject: string = `[Web Contact] message de ${emailFrom}`;

            const name: FormDataEntryValue | string = body.get("name") || "";
            if (!name.toString()) {
                hasError = true;
                errors.name = "empty name";
                console.error(errors.name);
            }

            const message: FormDataEntryValue | string = body.get("message") || "";
            if (!message.toString()) {
                hasError = true;
                errors.message = "empty message";
                console.error(errors.message);
            }

            if (hasError) {
                const response = JSON.stringify(
                    { "message": "invalid data", "errors": errors },
                    null,
                    2,
                );

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
                from: { name: NAME_TO, email: EMAIL_TO },
                content: [
                    { type: "text/plain", value: `${message.toString()}` },
                ],
            };

            let sendGridResponse = await sendMail(mail, { apiKey: SENDGRID_API_KEY });

            if (sendGridResponse.success === false) {
                console.error(sendGridResponse);
                const response = JSON.stringify(
                    { "message": "Error while sending message", "errors": sendGridResponse.errors },
                    null,
                    2,
                );

                return new Response(response, {
                    status: 400,
                    headers: responseHeaders,
                });
            }

            console.info(`${subject} successfully sent`);

            const data = {
                message: "sent!",
            };

            const response = JSON.stringify(data, null, 2);

            return new Response(response, {
                headers: responseHeaders,
            });
        }

        default:
            const data = {
                message: "Invalid method",
            };
            return new Response(JSON.stringify(data, null, 2), {
                status: 405,
                headers: responseHeaders,
            });
    }
}

serve(handler, { port: 8076 });
