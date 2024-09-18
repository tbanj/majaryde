import { Stripe } from "stripe";
const stripe = new Stripe(process.env.EXPO_STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const body = await request.json();
  const { payment_method_id, payment_intent_id, customer_id } = body;

  if (!payment_method_id || !payment_intent_id || !customer_id)
    return new Response(
      JSON.stringify({
        error: "Miss required payment information",
        status: 400,
      })
    );
}
