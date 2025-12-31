import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get orders for restaurant owner
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get restaurant for this user
    const restaurant = await sql`
      SELECT id FROM restaurants WHERE user_id = ${session.user.id} LIMIT 1
    `;

    if (restaurant.length === 0) {
      return Response.json({ orders: [] });
    }

    const orders = await sql`
      SELECT o.*, m.name as meal_name, m.image_url as meal_image
      FROM orders o
      JOIN meals m ON o.meal_id = m.id
      WHERE m.restaurant_id = ${restaurant[0].id}
      ORDER BY o.created_at DESC
    `;

    return Response.json({ orders });
  } catch (error) {
    console.error("Error fetching restaurant orders:", error);
    return Response.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
