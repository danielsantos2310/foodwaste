import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get orders for current user (customer)
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await sql`
      SELECT o.*, m.name as meal_name, m.image_url as meal_image, 
             r.name as restaurant_name, r.address, r.latitude, r.longitude
      FROM orders o
      JOIN meals m ON o.meal_id = m.id
      JOIN restaurants r ON m.restaurant_id = r.id
      WHERE o.customer_id = ${session.user.id}
      ORDER BY o.created_at DESC
    `;

    return Response.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return Response.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
