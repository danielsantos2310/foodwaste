import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Create a new meal
export async function POST(request) {
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
      return Response.json(
        { error: "Restaurant not found. Please create a restaurant first." },
        { status: 404 },
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      original_price,
      sale_price,
      image_url,
      available_until,
    } = body;

    if (!name || !original_price || !sale_price || !available_until) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO meals (restaurant_id, name, description, original_price, sale_price, image_url, available_until, status)
      VALUES (${restaurant[0].id}, ${name}, ${description || null}, ${original_price}, ${sale_price}, ${image_url || null}, ${available_until}, 'available')
      RETURNING *
    `;

    return Response.json({ meal: result[0] });
  } catch (error) {
    console.error("Error creating meal:", error);
    return Response.json({ error: "Failed to create meal" }, { status: 500 });
  }
}

// List available meals (for customers)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const latitude = searchParams.get("latitude");
    const longitude = searchParams.get("longitude");
    const radius = searchParams.get("radius") || 10; // km

    let meals;

    if (latitude && longitude) {
      // Find meals near the user's location
      meals = await sql`
        SELECT m.*, r.name as restaurant_name, r.address, r.latitude, r.longitude, r.image_url as restaurant_image
        FROM meals m
        JOIN restaurants r ON m.restaurant_id = r.id
        WHERE m.status = 'available' 
        AND m.available_until > NOW()
        AND (
          6371 * acos(
            cos(radians(${parseFloat(latitude)})) * 
            cos(radians(r.latitude)) * 
            cos(radians(r.longitude) - radians(${parseFloat(longitude)})) + 
            sin(radians(${parseFloat(latitude)})) * 
            sin(radians(r.latitude))
          )
        ) <= ${parseFloat(radius)}
        ORDER BY m.created_at DESC
      `;
    } else {
      // Return all available meals
      meals = await sql`
        SELECT m.*, r.name as restaurant_name, r.address, r.latitude, r.longitude, r.image_url as restaurant_image
        FROM meals m
        JOIN restaurants r ON m.restaurant_id = r.id
        WHERE m.status = 'available' 
        AND m.available_until > NOW()
        ORDER BY m.created_at DESC
      `;
    }

    return Response.json({ meals });
  } catch (error) {
    console.error("Error fetching meals:", error);
    return Response.json({ error: "Failed to fetch meals" }, { status: 500 });
  }
}
