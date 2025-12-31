import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Create order and process payment
export async function POST(request) {
  try {
    const session = await auth();
    const body = await request.json();
    const { meal_id } = body;

    if (!meal_id) {
      return Response.json({ error: "Meal ID is required" }, { status: 400 });
    }

    // Get meal details
    const meals = await sql`
      SELECT m.*, r.name as restaurant_name 
      FROM meals m
      JOIN restaurants r ON m.restaurant_id = r.id
      WHERE m.id = ${meal_id} AND m.status = 'available'
      LIMIT 1
    `;

    if (meals.length === 0) {
      return Response.json(
        { error: "Meal not found or no longer available" },
        { status: 404 },
      );
    }

    const meal = meals[0];

    // Check if meal is still available
    if (new Date(meal.available_until) < new Date()) {
      return Response.json({ error: "Meal has expired" }, { status: 400 });
    }

    // Calculate commission split (70% restaurant, 30% platform)
    const salePrice = parseFloat(meal.sale_price);
    const restaurantEarnings = salePrice * 0.7;
    const platformCommission = salePrice * 0.3;

    // Create Stripe payment intent
    const stripeResponse = await fetch(
      "https://api.stripe.com/v1/payment_intents",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          amount: Math.round(salePrice * 100), // Convert to cents
          currency: "eur",
          "metadata[meal_id]": meal_id.toString(),
          "metadata[meal_name]": meal.name,
          "metadata[restaurant_name]": meal.restaurant_name,
        }),
      },
    );

    if (!stripeResponse.ok) {
      throw new Error("Failed to create payment intent");
    }

    const paymentIntent = await stripeResponse.json();

    // Generate unique QR code
    const qrCode = `MEAL-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    // Calculate pickup deadline (1 hour from now)
    const pickupDeadline = new Date(Date.now() + 60 * 60 * 1000);

    // Create order
    const order = await sql`
      INSERT INTO orders (
        meal_id, 
        customer_id, 
        customer_email,
        qr_code, 
        pickup_deadline, 
        payment_intent_id,
        amount_paid,
        restaurant_earnings,
        platform_commission,
        status
      )
      VALUES (
        ${meal_id},
        ${session?.user?.id || null},
        ${session?.user?.email || null},
        ${qrCode},
        ${pickupDeadline.toISOString()},
        ${paymentIntent.id},
        ${salePrice},
        ${restaurantEarnings},
        ${platformCommission},
        'pending'
      )
      RETURNING *
    `;

    // Mark meal as sold
    await sql`
      UPDATE meals SET status = 'sold' WHERE id = ${meal_id}
    `;

    return Response.json({
      order: order[0],
      clientSecret: paymentIntent.client_secret,
      meal: meal,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return Response.json({ error: "Failed to create order" }, { status: 500 });
  }
}
