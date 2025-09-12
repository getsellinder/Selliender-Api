import { createCheckoutSession } from "./stripeModel.js";

export async function createCheckoutSessionController(req, res) {
  try {
    const sessionId = await createCheckoutSession(req.body);
    res.json({ id: sessionId });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
}
