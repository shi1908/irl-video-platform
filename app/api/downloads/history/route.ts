import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please log in.",
        },
        { status: 401 }
      );
    }

    const downloads = await prisma.download.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        downloadedAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      downloads,
    });
  } catch (error) {
    console.error("DOWNLOAD HISTORY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Could not load download history.",
      },
      { status: 500 }
    );
  }
}