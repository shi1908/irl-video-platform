import { NextResponse } from "next/server";
import { getRazorpay } from "@/lib/razorpay";
import { getCurrentUser } from "@/lib/auth";

const PLANS = {
  bronze: {
    name: "Bronze",
    monthly: 14900,
    yearly: 149000,
  },
  silver: {
    name: "Silver",
    monthly: 29900,
    yearly: 299000,
  },
  gold: {
    name: "Gold",
    monthly: 49900,
    yearly: 499000,
  },
};

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please log in first.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const plan = body.plan?.toLowerCase();

    const billing =
      body.billing === "yearly"
        ? "yearly"
        : "monthly";

    if (
      !plan ||
      !Object.prototype.hasOwnProperty.call(PLANS, plan)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid plan.",
        },
        { status: 400 }
      );
    }

    const selectedPlan =
      PLANS[plan as keyof typeof PLANS];

    const amount =
      billing === "yearly"
        ? selectedPlan.yearly
        : selectedPlan.monthly;

    console.log("========== RAZORPAY DEBUG ==========");
    console.log(
      "Key exists:",
      !!process.env.RAZORPAY_KEY_ID
    );
    console.log(
      "Key prefix:",
      process.env.RAZORPAY_KEY_ID?.slice(0, 10)
    );
    console.log(
      "Secret exists:",
      !!process.env.RAZORPAY_KEY_SECRET
    );
    console.log("Plan:", plan);
    console.log("Billing:", billing);
    console.log("Amount:", amount);
    console.log("User:", user.email);
    console.log("====================================");

    // Create Razorpay instance only when the API is called.
    const razorpay = getRazorpay();

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `irl_${user.id}_${Date.now()}`,
      notes: {
        userId: user.id,
        plan,
        billing,
      },
    });

    console.log(
      "RAZORPAY ORDER CREATED:",
      order.id
    );

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      plan: {
        name: selectedPlan.name,
        key: plan,
        billing,
      },
    });
  } catch (error: any) {
    console.error(
      "========== RAZORPAY ERROR =========="
    );
    console.error(
      "STATUS:",
      error?.statusCode
    );
    console.error(
      "ERROR:",
      error?.error
    );
    console.error(
      "MESSAGE:",
      error?.message
    );
    console.error(
      "DESCRIPTION:",
      error?.error?.description
    );
    console.error(
      "CODE:",
      error?.error?.code
    );
    console.error(
      "===================================="
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.error?.description ||
          error?.message ||
          "Could not create payment order.",
        code:
          error?.error?.code || null,
      },
      { status: 500 }
    );
  }
}