import { neon } from "@neondatabase/serverless";

/* const posts = await sql("SELECT * FROM posts"); */
export async function GET(request: Request, { id }: { id: string }) {
  const sql = neon(`${process.env.DATABASE_URL}`);
  const { name, email, clerkId, primary_phone_number } = await request.json();
  try {
    if (!name || !email || !clerkId || !primary_phone_number) {
      return Response.json(
        { error: "Missing request fields" },
        { status: 400 }
      );
    }
    const response = await sql`
     SELECT
      primary_phone_number,
      name,
      clerk_id,
      primary_phone_number
     FROM 
      users
     WHERE 
        users.clerk_id = ${id}
      ORDER BY 
        users.id DESC;
    `;
    return new Response(JSON.stringify({ data: response }), { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json({ error }, { status: 500 });
  }
}

// See https://neon.tech/docs/serverless/serverless-driver
// for more information
