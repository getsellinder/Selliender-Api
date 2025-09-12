import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET);

export async function createCheckoutSession(body) {
  const lineItems = body.products.map(({ product, quantity }) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: product.name,
        images: [product.image[0].url], // assuming you want to use the first image URL
      },
      unit_amount: Math.round(product.price * 100), // Ensure proper conversion to cents
    },
    quantity: quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: "http://localhost:5173/order-complete", // Provide your success URL here
    cancel_url: "http://localhost:5173/cart", // Provide your cancel URL here
  });

  return session.id;
}
