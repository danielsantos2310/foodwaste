import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get meals for the current restaurant
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
      return Response.json({ meals: [] });
    }

    const meals = await sql`
      SELECT * FROM meals 
      WHERE restaurant_id = ${restaurant[0].id}
      ORDER BY created_at DESC
    `;

    return Response.json({ meals });
  } catch (error) {
    console.error("Error fetching meals:", error);
    return Response.json({ error: "Failed to fetch meals" }, { status: 500 });
  }
}
