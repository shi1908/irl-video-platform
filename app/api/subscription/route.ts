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
          message: "Not authenticated",
        },
        { status: 401 }
      );
    }

    // Get the user's latest subscription
    const subscription =
      await prisma.subscription.findFirst({
        where: {
          userId: user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    // If user has no paid subscription,
    // return their default Free plan.
    if (!subscription) {
      return NextResponse.json({
        success: true,
        subscription: {
          id: null,
          plan: "free",
          billingCycle: null,
          amount: 0,
          currency: "INR",
          paymentId: null,
          orderId: null,
          invoiceNumber: null,
          paymentStatus: "active",
          startDate: null,
          expiryDate: null,
          renewalDate: null,
        },
      });
    }

    // Automatically treat expired subscriptions as expired
    // and downgrade the user's active plan to Free.
    if (
      subscription.expiryDate &&
      subscription.expiryDate < new Date() &&
      user.plan !== "free"
    ) {
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

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        plan: subscription.plan,
        billingCycle: subscription.billingCycle,
        amount: subscription.amount,
        currency: subscription.currency,
        paymentId: subscription.paymentId,
        orderId: subscription.orderId,
        invoiceNumber: subscription.invoiceNumber,
        paymentStatus: subscription.paymentStatus,
        startDate: subscription.startDate,
        expiryDate: subscription.expiryDate,
        renewalDate: subscription.renewalDate,
      },
    });
  } catch (error) {
    console.error(
      "Failed to fetch subscription:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch subscription",
      },
      { status: 500 }
    );
  }
}