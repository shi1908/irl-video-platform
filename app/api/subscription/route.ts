import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // Get cookies from the request
    const cookieHeader = request.headers.get("cookie");

    if (!cookieHeader) {
      return Response.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 }
      );
    }

    // Find the session cookie
    const sessionCookie = cookieHeader
      .split(";")
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith("session="));

    if (!sessionCookie) {
      return Response.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 }
      );
    }

    // Extract the token
    const sessionToken = sessionCookie
      .substring("session=".length)
      .trim();

    if (!sessionToken) {
      return Response.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 }
      );
    }

    // Find the logged-in session
    const session = await prisma.session.findUnique({
      where: {
        token: sessionToken,
      },
      include: {
        user: true,
      },
    });

    // Session doesn't exist
    if (!session) {
      return Response.json(
        {
          success: false,
          message: "Invalid session",
        },
        { status: 401 }
      );
    }

    // Session has expired
    if (session.expiresAt < new Date()) {
      return Response.json(
        {
          success: false,
          message: "Session expired",
        },
        { status: 401 }
      );
    }

    // Find the user's subscription separately
    let subscription = await prisma.subscription.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    // Give every user a FREE subscription by default
    if (!subscription) {
      subscription = await prisma.subscription.create({
        data: {
          userId: session.user.id,
          plan: "FREE",
          status: "ACTIVE",
        },
      });
    }

    // Return subscription information
    return Response.json({
      success: true,
      subscription: {
        id: subscription.id,
        plan: subscription.plan,
        status: subscription.status,
        startedAt: subscription.startedAt,
        expiresAt: subscription.expiresAt,
      },
    });
  } catch (error) {
    console.error("Failed to fetch subscription:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to fetch subscription",
      },
      { status: 500 }
    );
  }
}