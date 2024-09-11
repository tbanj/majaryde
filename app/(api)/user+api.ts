import { neon } from "@neondatabase/serverless";

/* const posts = await sql("SELECT * FROM posts"); */
export async function POST(request: Request) {
  const sql = neon(`${process.env.DATABASE_URL}`);
  const { name, email, clerkId } = await request.json();
  try {
    if (!name || !email || !clerkId) {
      return Response.json(
        { error: "Missing request fields" },
        { status: 400 }
      );
    }
    const response = await sql`
        INSERT INTO users (
        name, email, clerk_id
        )
        VALUES (
            ${name},
            ${email},
            ${clerkId}
        )
        `;
    return new Response(JSON.stringify({ data: response }), { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json({ error }, { status: 500 });
  }
}

// See https://neon.tech/docs/serverless/serverless-driver
// for more information
