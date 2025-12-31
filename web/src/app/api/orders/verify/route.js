import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Verify QR code and complete order
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { qr_code } = body;

    if (!qr_code) {
      return Response.json({ error: "QR code is required" }, { status: 400 });
    }

    // Get restaurant for this user
    const restaurant = await sql`
      SELECT id FROM restaurants WHERE user_id = ${session.user.id} LIMIT 1
    `;

    if (restaurant.length === 0) {
      return Response.json({ error: "Restaurant not found" }, { status: 404 });
    }

    // Find order with this QR code for this restaurant
    const orders = await sql`
      SELECT o.*, m.name as meal_name, m.restaurant_id
      FROM orders o
      JOIN meals m ON o.meal_id = m.id
      WHERE o.qr_code = ${qr_code} 
      AND m.restaurant_id = ${restaurant[0].id}
      LIMIT 1
    `;

    if (orders.length === 0) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    const order = orders[0];

    if (order.status === "completed") {
      return Response.json(
        { error: "Order already completed" },
        { status: 400 },
      );
    }

    if (order.status === "cancelled") {
      return Response.json({ error: "Order was cancelled" }, { status: 400 });
    }

    // Check if pickup deadline has passed
    if (new Date(order.pickup_deadline) < new Date()) {
      return Response.json(
        { error: "Pickup deadline has passed" },
        { status: 400 },
      );
    }

    // Mark order as completed
    const updated = await sql`
      UPDATE orders 
      SET status = 'completed', completed_at = NOW()
      WHERE id = ${order.id}
      RETURNING *
    `;

    return Response.json({
      success: true,
      order: updated[0],
    });
  } catch (error) {
    console.error("Error verifying order:", error);
    return Response.json({ error: "Failed to verify order" }, { status: 500 });
  }
}
