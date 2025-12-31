import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Create a new restaurant
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      address,
      latitude,
      longitude,
      phone,
      description,
      image_url,
    } = body;

    if (!name || !address) {
      return Response.json(
        { error: "Name and address are required" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO restaurants (user_id, name, address, latitude, longitude, phone, description, image_url)
      VALUES (${session.user.id}, ${name}, ${address}, ${latitude || null}, ${longitude || null}, ${phone || null}, ${description || null}, ${image_url || null})
      RETURNING *
    `;

    return Response.json({ restaurant: result[0] });
  } catch (error) {
    console.error("Error creating restaurant:", error);
    return Response.json(
      { error: "Failed to create restaurant" },
      { status: 500 },
    );
  }
}

// Get restaurant by user ID
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await sql`
      SELECT * FROM restaurants WHERE user_id = ${session.user.id} LIMIT 1
    `;

    if (result.length === 0) {
      return Response.json({ restaurant: null });
    }

    return Response.json({ restaurant: result[0] });
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    return Response.json(
      { error: "Failed to fetch restaurant" },
      { status: 500 },
    );
  }
}
