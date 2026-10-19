// Mass-mail/automation sits in Sender.net's own dashboard (free tier: 2,500
// contacts, 15,000 emails/month, automations included) — this just keeps
// its subscriber list mirroring our own newsletter_subs table, so a
// campaign/automation built there always reaches everyone who signed up on
// the site. No API key configured yet = every call here is a silent no-op,
// same pattern as src/lib/email.ts's optional RESEND_API_KEY.
//
// SENDER_GROUP_ID is optional: create one group in Sender's dashboard
// ("Site Festina" or similar), copy its id, and set it here so campaigns
// can target that list specifically instead of every contact on the
// account.

const BASE_URL = "https://api.sender.net/v2";

async function senderRequest(path: string, method: string, body: unknown): Promise<Response | null> {
  const apiKey = process.env.SENDER_API_KEY;
  if (!apiKey) return null;
  return fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
}

/** Adds (or updates, if already there) a subscriber in Sender.net. */
export async function syncNewsletterSubscriber(email: string, name?: string | null): Promise<void> {
  if (!process.env.SENDER_API_KEY) return;
  const groupId = process.env.SENDER_GROUP_ID;
  const payload: Record<string, unknown> = { email };
  if (name) payload.firstname = name;
  if (groupId) payload.groups = [groupId];

  try {
    const res = await senderRequest("/subscribers", "POST", payload);
    if (res && !res.ok) {
      // Most likely cause: this email is already a Sender contact — POST
      // creates, so update it instead via the email-addressed PATCH route
      // instead of needing to know its internal Sender id.
      await senderRequest(`/subscribers/${encodeURIComponent(email)}`, "PATCH", payload);
    }
  } catch (err) {
    console.error("Sender.net subscriber sync failed:", err);
  }
}

/** Removes a subscriber from Sender.net entirely (not just a group) — used
 * both when someone unsubscribes and when an admin deletes the row here. */
export async function removeNewsletterSubscriber(email: string): Promise<void> {
  if (!process.env.SENDER_API_KEY) return;
  try {
    await senderRequest("/subscribers", "DELETE", { subscribers: [email] });
  } catch (err) {
    console.error("Sender.net subscriber delete failed:", err);
  }
}
