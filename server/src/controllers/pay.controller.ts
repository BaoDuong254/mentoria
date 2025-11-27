import { Request, Response } from "express";
import { CreateCheckoutSessionSchema, TCreateCheckoutSessionSchema } from "@/validation/pay.schema";
import { createCheckoutSessionService, handleCheckoutSessionCompletedService } from "@/services/pay.service";
import envConfig from "@/config/env";
import Stripe from "stripe";

const stripe = new Stripe(envConfig.STRIPE_SECRET_KEY, {
  apiVersion: "2025-11-17.clover",
});

const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const requestData = req.body as TCreateCheckoutSessionSchema;

    // Validate input
    const validate = await CreateCheckoutSessionSchema.safeParseAsync(requestData);

    if (!validate.success) {
      const errorsZod = validate.error.issues;
      const errors = errorsZod?.map((err) => `${err.message}: ${String(err.path[0])}`);
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        data: { errors },
      });
    }

    // Create checkout session
    const result = await createCheckoutSessionService(validate.data);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        sessionId: result.sessionId,
        sessionUrl: result.sessionUrl,
      },
    });
  } catch (error) {
    console.error("Error in createCheckoutSession controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const handleWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    console.error("Missing stripe-signature header");
    return res.status(400).json({
      success: false,
      message: "Missing stripe-signature header",
    });
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, envConfig.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return res.status(400).json({
      success: false,
      message: `Webhook Error: ${err instanceof Error ? err.message : "Unknown error"}`,
    });
  }

  // Handle the event
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`Checkout session completed: ${session.id}`);

        // Process the completed checkout session
        await handleCheckoutSessionCompletedService(session);

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return a response to acknowledge receipt of the event
    return res.status(200).json({
      success: true,
      message: "Webhook received",
    });
  } catch (error) {
    console.error("Error handling webhook event:", error);
    return res.status(500).json({
      success: false,
      message: "Error processing webhook",
    });
  }
};

export { createCheckoutSession, handleWebhook };
