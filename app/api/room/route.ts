import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { name, creatorId } = body;

    if (!creatorId) {
      return Response.json(
        {
          success: false,
          error: "creatorId is required",
        },
        { status: 400 }
      );
    }

    const room = await prisma.room.create({
      data: {
        name: name || "Video Call",
        creatorId,
      },
    });

    return Response.json(
      {
        success: true,
        room,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create room:", error);

    return Response.json(
      {
        success: false,
        error: "Failed to create room",
      },
      { status: 500 }
    );
  }
}