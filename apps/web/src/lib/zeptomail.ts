export async function sendMail({
  to,
  subject,
  htmlBody,
}: {
  to: string;
  subject: string;
  htmlBody: string;
}): Promise<void> {
  const response = await fetch("https://api.zeptomail.com/v1.1/email", {
    method: "POST",
    headers: {
      Authorization: `Zoho-enczapikey ${process.env.ZEPTOMAIL_API_KEY}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: {
        address: process.env.ZEPTOMAIL_FROM_EMAIL,
        name: process.env.ZEPTOMAIL_FROM_NAME,
      },
      to: [{ email_address: { address: to } }],
      subject,
      htmlbody: htmlBody,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`ZeptoMail send failed (${response.status}): ${body}`);
  }
}
