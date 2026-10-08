import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const DOWNLOAD_LIMITS: Record<string, number> = {
  free: 1,
  bronze: 5,
  silver: 15,
  gold: 30,
};

export async function POST(request: Request) {
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

    const body = await request.json();

    const videoId = body.videoId?.trim();

    if (!videoId) {
      return NextResponse.json(
        {
          success: false,
          message: "Video ID is required.",
        },
        { status: 400 }
      );
    }

    // Check subscription expiry
    let currentPlan = user.plan.toLowerCase();

    if (
      user.planExpiresAt &&
      user.planExpiresAt < new Date() &&
      currentPlan !== "free"
    ) {
      currentPlan = "free";

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          plan: "free",
          planExpiresAt: null,
        },
      });
    }

    const limit =
      DOWNLOAD_LIMITS[currentPlan] ??
      DOWNLOAD_LIMITS.free;

    // Start of today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // End of today
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Count today's downloads
    const downloadsToday = await prisma.download.count({
      where: {
        userId: user.id,
        downloadedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: "completed",
      },
    });

    if (downloadsToday >= limit) {
      return NextResponse.json(
        {
          success: false,
          message: `Daily download limit reached. Your ${currentPlan} plan allows ${limit} download${
            limit === 1 ? "" : "s"
          } per day.`,
          limit,
          used: downloadsToday,
          remaining: 0,
          plan: currentPlan,
        },
        { status: 429 }
      );
    }

    // Prevent duplicate download of the same video today
    const existingDownload =
      await prisma.download.findFirst({
        where: {
          userId: user.id,
          videoId,
          downloadedAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
          status: "completed",
        },
      });

    if (existingDownload) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You have already downloaded this video today.",
          limit,
          used: downloadsToday,
          remaining: limit - downloadsToday,
          plan: currentPlan,
        },
        { status: 409 }
      );
    }

    // Get request information
    const forwardedFor =
      request.headers.get("x-forwarded-for");

    const realIp =
      request.headers.get("x-real-ip");

    const ipAddress =
      forwardedFor?.split(",")[0]?.trim() ||
      realIp ||
      "unknown";

    const userAgent =
      request.headers.get("user-agent") ||
      "unknown";

    let device = "Desktop";

    if (/mobile/i.test(userAgent)) {
      device = "Mobile";
    } else if (/tablet/i.test(userAgent)) {
      device = "Tablet";
    }

    let browser = "Unknown";

    if (/edg/i.test(userAgent)) {
      browser = "Microsoft Edge";
    } else if (/chrome/i.test(userAgent)) {
      browser = "Google Chrome";
    } else if (/firefox/i.test(userAgent)) {
      browser = "Mozilla Firefox";
    } else if (/safari/i.test(userAgent)) {
      browser = "Safari";
    }

    // Create download record
    const download = await prisma.download.create({
      data: {
        userId: user.id,
        videoId,
        ipAddress,
        device,
        browser,
        plan: currentPlan,
        status: "completed",
      },
    });

    const used = downloadsToday + 1;
    const remaining = Math.max(limit - used, 0);

    return NextResponse.json({
      success: true,
      message: "Download approved.",
      downloadId: download.id,
      videoId,
      plan: currentPlan,
      limit,
      used,
      remaining,

      // Frontend can use this to start the actual file download.
      downloadAllowed: true,
    });
  } catch (error) {
    console.error("Download error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while processing the download.",
      },
      { status: 500 }
    );
  }
}