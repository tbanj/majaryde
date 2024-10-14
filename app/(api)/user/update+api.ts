import { neon } from "@neondatabase/serverless";

/* const posts = await sql("SELECT * FROM posts"); */
export async function PUT(request: Request) {
  const sql = neon(`${process.env.DATABASE_URL}`);
  const { name, email, clerkId, primary_phone_number } = await request.json();
  try {
    if (!name || !email || !clerkId || !primary_phone_number) {
      return Response.json(
        { error: "Missing request fields" },
        { status: 400 },
      );
    }
    const response = await sql`
     UPDATE users
SET name = ${name},
    primary_phone_number = ${primary_phone_number},
    email = ${email}
WHERE clerk_id = ${clerkId};
    `;
    return new Response(JSON.stringify({ data: response }), { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json({ error }, { status: 500 });
  }
}

// See https://neon.tech/docs/serverless/serverless-driver
// for more information
