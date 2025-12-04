import poolPromise from "@/config/database";
import envConfig from "@/config/env";
import Stripe from "stripe";
import {
  BookingValidationResult,
  CheckoutSessionMetadata,
  CreateBookingData,
  CreateCheckoutSessionRequest,
  CreateInvoiceData,
  CreateMeetingData,
  DiscountDetails,
  PlanDetails,
  SlotDetails,
} from "@/types/pay.type";
import { sendBookingConfirmation } from "@/mailtrap/mailSend";
import { BookingConfirmationData } from "@/types/mail.type";

const stripe = new Stripe(envConfig.STRIPE_SECRET_KEY, {
  apiVersion: "2025-11-17.clover",
});

const validateBookingService = async (data: CreateCheckoutSessionRequest): Promise<BookingValidationResult> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    // 1. Verify mentee exists
    const menteeCheck = await pool.request().input("menteeId", data.menteeId).query(`
      SELECT user_id FROM mentees WHERE user_id = @menteeId
    `);

    if (menteeCheck.recordset.length === 0) {
      return { isValid: false, error: "Mentee not found" };
    }

    // 2. Verify mentor exists
    const mentorCheck = await pool.request().input("mentorId", data.mentorId).query(`
      SELECT user_id FROM mentors WHERE user_id = @mentorId
    `);

    if (mentorCheck.recordset.length === 0) {
      return { isValid: false, error: "Mentor not found" };
    }

    // 3. Get plan details and verify it belongs to the mentor
    const planResult = await pool.request().input("planId", data.planId).input("mentorId", data.mentorId).query(`
      SELECT plan_id, plan_description, plan_charge, plan_type, mentor_id
      FROM plans
      WHERE plan_id = @planId AND mentor_id = @mentorId
    `);

    if (planResult.recordset.length === 0) {
      return { isValid: false, error: "Plan not found or does not belong to this mentor" };
    }

    const plan: PlanDetails = planResult.recordset[0];

    // 4. Verify slot exists and is available
    // Parse ISO datetime strings
    const startDateTime = new Date(data.slotStartTime);
    const endDateTime = new Date(data.slotEndTime);

    // Validate datetime parsing
    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      return { isValid: false, error: "Invalid datetime format" };
    }

    const slotResult = await pool
      .request()
      .input("mentorId", data.mentorId)
      .input("startTime", startDateTime)
      .input("endTime", endDateTime)
      .input("date", startDateTime.toISOString().split("T")[0]) // Extract date portion
      .input("planId", data.planId).query(`
      SELECT mentor_id, start_time, end_time, date, status, plan_id
      FROM slots
      WHERE mentor_id = @mentorId
        AND start_time = @startTime
        AND end_time = @endTime
        AND CAST(date AS DATE) = @date
        AND plan_id = @planId
    `);

    if (slotResult.recordset.length === 0) {
      return { isValid: false, error: "Slot not found" };
    }

    const slot: SlotDetails = slotResult.recordset[0];

    if (slot.status !== "Available") {
      return { isValid: false, error: "Slot is not available" };
    }

    // 5. Calculate pricing
    let discount: DiscountDetails | undefined = undefined;
    let discountAmount = 0;
    let finalAmount = plan.plan_charge;

    if (data.discountCode) {
      const discountResult = await pool.request().input("discountCode", data.discountCode).query(`
        SELECT discount_id, discount_name, discount_type, discount_value, start_date, end_date, status, usage_limit, used_count
        FROM discounts
        WHERE discount_name = @discountCode
      `);

      if (discountResult.recordset.length > 0) {
        const discountData = discountResult.recordset[0];
        const now = new Date();
        const startDate = new Date(discountData.start_date);
        const endDate = new Date(discountData.end_date);

        // Validate discount
        if (discountData.status !== "Active") {
          return { isValid: false, error: "Discount code is not active" };
        }

        if (now < startDate || now > endDate) {
          return { isValid: false, error: "Discount code is expired or not yet valid" };
        }

        if (discountData.used_count >= discountData.usage_limit) {
          return { isValid: false, error: "Discount code usage limit reached" };
        }

        discount = discountData;

        // Calculate discount amount
        if (discountData.discount_type === "Percentage") {
          discountAmount = (plan.plan_charge * discountData.discount_value) / 100;
        } else {
          // Fixed
          discountAmount = discountData.discount_value;
        }

        // Ensure discount doesn't exceed plan charge
        if (discountAmount > plan.plan_charge) {
          discountAmount = plan.plan_charge;
        }

        finalAmount = plan.plan_charge - discountAmount;
      } else {
        return { isValid: false, error: "Invalid discount code" };
      }
    }

    return {
      isValid: true,
      plan,
      slot,
      discount: discount || undefined,
      finalAmount,
      discountAmount,
    };
  } catch (error) {
    console.error("Error in validateBookingService:", error);
    throw error;
  }
};

const createCheckoutSessionService = async (
  data: CreateCheckoutSessionRequest
): Promise<{
  success: boolean;
  message: string;
  sessionId?: string | undefined;
  sessionUrl?: string | undefined;
}> => {
  try {
    // Validate booking
    const validation = await validateBookingService(data);

    if (!validation.isValid) {
      return {
        success: false,
        message: validation.error || "Invalid booking request",
      };
    }

    const { plan, finalAmount, discount } = validation;

    // Prepare metadata for webhook
    const metadata: CheckoutSessionMetadata = {
      menteeId: data.menteeId.toString(),
      mentorId: data.mentorId.toString(),
      planId: data.planId.toString(),
      slotStartTime: data.slotStartTime,
      slotEndTime: data.slotEndTime,
      message: data.message,
      discountId: discount?.discount_id.toString() ?? null,
    };

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${plan!.plan_type} - ${plan!.plan_description}`,
              description: `Booking with mentor from ${new Date(data.slotStartTime).toISOString()} to ${new Date(data.slotEndTime).toISOString()}`,
            },
            unit_amount: Math.round(finalAmount! * 100), // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_creation: "always", // Always create a customer for payment tracking
      success_url: `${envConfig.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${envConfig.CLIENT_URL}/payment/cancel`,
      metadata,
    });

    return {
      success: true,
      message: "Checkout session created successfully",
      sessionId: session.id,
      sessionUrl: (session.url ?? undefined) as string | undefined,
    };
  } catch (error) {
    console.error("Error in createCheckoutSessionService:", error);
    throw error;
  }
};

const createInvoiceService = async (
  data: CreateInvoiceData,
  registrationId: number,
  menteeId: number
): Promise<number> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    const result = await pool
      .request()
      .input("registrationId", registrationId)
      .input("amount", data.finalAmount)
      .input("method", "Stripe")
      .input("menteeId", menteeId)
      .input("stripeSessionId", data.stripeSessionId || null)
      .input("stripeCustomerId", data.stripeCustomerId || null)
      .input("stripeCustomerEmail", data.stripeCustomerEmail || null)
      .input("stripePaymentIntentId", data.stripePaymentIntentId || null)
      .input("stripeChargeId", data.stripeChargeId || null)
      .input("stripeBalanceTransactionId", data.stripeBalanceTransactionId || null)
      .input("stripeReceiptUrl", data.stripeReceiptUrl || null)
      .input("paymentStatus", data.paymentStatus || null)
      .input("currency", data.currency || null)
      .input("amountSubtotal", data.amountSubtotal || null)
      .input("amountTotal", data.amountTotal / 100).query(`
      INSERT INTO invoices (
        plan_registerations_id, amount, method, mentee_id,
        stripe_session_id, stripe_customer_id, stripe_customer_email,
        stripe_payment_intent_id, stripe_charge_id, stripe_balance_transaction_id,
        stripe_receipt_url, payment_status, currency, amount_subtotal, amount_total
      )
      OUTPUT INSERTED.invoice_id
      VALUES (
        @registrationId, @amount, @method, @menteeId,
        @stripeSessionId, @stripeCustomerId, @stripeCustomerEmail,
        @stripePaymentIntentId, @stripeChargeId, @stripeBalanceTransactionId,
        @stripeReceiptUrl, @paymentStatus, @currency, @amountSubtotal, @amountTotal
      )
    `);

    return result.recordset[0].invoice_id;
  } catch (error) {
    console.error("Error in createInvoiceService:", error);
    throw error;
  }
};

const createPlanRegistrationService = async (message: string, discountId?: number): Promise<number> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    const result = await pool
      .request()
      .input("message", message)
      .input("discountId", discountId || null).query(`
      INSERT INTO plan_registerations (message, discount_id)
      OUTPUT INSERTED.registration_id
      VALUES (@message, @discountId)
    `);

    return result.recordset[0].registration_id;
  } catch (error) {
    console.error("Error in createPlanRegistrationService:", error);
    throw error;
  }
};

const createBookingService = async (data: CreateBookingData): Promise<void> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    await pool
      .request()
      .input("menteeId", data.menteeId)
      .input("registrationId", data.registrationId)
      .input("planId", data.planId).query(`
      INSERT INTO bookings (mentee_id, plan_registerations_id, plan_id)
      VALUES (@menteeId, @registrationId, @planId)
    `);
  } catch (error) {
    console.error("Error in createBookingService:", error);
    throw error;
  }
};

const updateSlotStatusService = async (mentorId: number, slotStartTime: string, slotEndTime: string): Promise<void> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    // Parse ISO datetime strings
    const startDateTime = new Date(slotStartTime);
    const endDateTime = new Date(slotEndTime);
    const dateStr = startDateTime.toISOString().split("T")[0];

    await pool
      .request()
      .input("mentorId", mentorId)
      .input("date", dateStr)
      .input("startTime", startDateTime)
      .input("endTime", endDateTime)
      .input("status", "Booked").query(`
      UPDATE slots
      SET status = @status
      WHERE mentor_id = @mentorId
        AND CAST(date AS DATE) = @date
        AND start_time = @startTime
        AND end_time = @endTime
    `);
  } catch (error) {
    console.error("Error in updateSlotStatusService:", error);
    throw error;
  }
};

const createMeetingService = async (
  data: CreateMeetingData,
  invoiceId: number,
  registrationId: number
): Promise<number> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    // Parse ISO datetime strings
    const startDateTime = new Date(data.slotStartTime);
    const endDateTime = new Date(data.slotEndTime);
    const dateStr = startDateTime.toISOString().split("T")[0];

    const result = await pool
      .request()
      .input("invoiceId", invoiceId)
      .input("registrationId", registrationId)
      .input("location", "") // Location to be determined later
      .input("startTime", startDateTime)
      .input("endTime", endDateTime)
      .input("date", dateStr)
      .input("mentorId", data.mentorId).query(`
      INSERT INTO meetings (invoice_id, plan_registerations_id, location, start_time, end_time, date, mentor_id)
      OUTPUT INSERTED.meeting_id
      VALUES (@invoiceId, @registrationId, @location, @startTime, @endTime, @date, @mentorId)
    `);

    return result.recordset[0].meeting_id;
  } catch (error) {
    console.error("Error in createMeetingService:", error);
    throw error;
  }
};

const incrementDiscountUsageService = async (discountId: number): Promise<void> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    await pool.request().input("discountId", discountId).query(`
      UPDATE discounts
      SET used_count = used_count + 1
      WHERE discount_id = @discountId
    `);
  } catch (error) {
    console.error("Error in incrementDiscountUsageService:", error);
    throw error;
  }
};

const handleCheckoutSessionCompletedService = async (session: Stripe.Checkout.Session): Promise<void> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  // Extract metadata
  const metadata = session.metadata as unknown as CheckoutSessionMetadata;

  if (!metadata || !metadata.menteeId || !metadata.mentorId || !metadata.planId) {
    throw new Error("Session metadata is missing or incomplete");
  }

  const { menteeId, mentorId, planId, slotStartTime, slotEndTime, message, discountId } = metadata;

  // Start transaction
  const transaction = pool.transaction();
  await transaction.begin();

  try {
    // 1. Create plan registration first (required by invoice foreign key)
    const registrationId = await createPlanRegistrationService(message, discountId ? parseInt(discountId) : undefined);

    // Calculate discount amount
    let discountAmount = 0;
    if (discountId && session.amount_total) {
      const discountResult = await pool.request().input("discountId", parseInt(discountId)).query(`
        SELECT discount_type, discount_value FROM discounts WHERE discount_id = @discountId
      `);

      if (discountResult.recordset.length > 0) {
        const discount = discountResult.recordset[0];
        const totalBeforeDiscount = (session.amount_total || 0) / 100;

        if (discount.discount_type === "Percentage") {
          discountAmount = (totalBeforeDiscount * discount.discount_value) / (100 - discount.discount_value);
        } else {
          discountAmount = discount.discount_value;
        }
      }
    }

    // 2. Extract Stripe details from expanded session
    let chargeId: string | undefined;
    let balanceTransactionId: string | undefined;
    let receiptUrl: string | undefined;
    let customerId: string | undefined;

    // Get customer ID from session
    if (session.customer) {
      customerId = typeof session.customer === "string" ? session.customer : session.customer.id;
    }

    // Get payment intent details
    if (session.payment_intent) {
      const paymentIntent =
        typeof session.payment_intent === "string" ? undefined : (session.payment_intent as Stripe.PaymentIntent);

      if (paymentIntent) {
        // Get customer from payment intent if not in session
        if (!customerId && paymentIntent.customer) {
          customerId = typeof paymentIntent.customer === "string" ? paymentIntent.customer : paymentIntent.customer.id;
        }

        // Get charge details from latest_charge
        if (paymentIntent.latest_charge) {
          const charge =
            typeof paymentIntent.latest_charge === "string"
              ? undefined
              : (paymentIntent.latest_charge as Stripe.Charge);

          if (charge) {
            chargeId = charge.id;
            receiptUrl = charge.receipt_url || undefined;

            // Get balance transaction ID
            if (charge.balance_transaction) {
              balanceTransactionId =
                typeof charge.balance_transaction === "string"
                  ? charge.balance_transaction
                  : charge.balance_transaction.id;
            } else {
              // Balance transaction might not be available immediately - retry once
              try {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                const retrievedCharge = await stripe.charges.retrieve(charge.id);
                if (retrievedCharge.balance_transaction) {
                  balanceTransactionId =
                    typeof retrievedCharge.balance_transaction === "string"
                      ? retrievedCharge.balance_transaction
                      : retrievedCharge.balance_transaction.id;
                }
              } catch (retryError) {
                console.error("Error retrieving balance transaction:", retryError);
              }
            }
          }
        }
      }
    }

    // 3. Create invoice with complete Stripe information
    const invoiceId = await createInvoiceService(
      {
        sessionId: session.id,
        amountTotal: session.amount_total || 0,
        currency: session.currency || "usd",
        discountAmount: discountAmount,
        finalAmount: (session.amount_total || 0) / 100,
        discountId: discountId ? parseInt(discountId) : undefined,
        stripeSessionId: session.id,
        stripeCustomerId: customerId,
        stripeCustomerEmail: session.customer_details?.email || session.customer_email || undefined,
        stripePaymentIntentId:
          typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id,
        stripeChargeId: chargeId,
        stripeBalanceTransactionId: balanceTransactionId,
        stripeReceiptUrl: receiptUrl,
        paymentStatus: session.payment_status,
        amountSubtotal: session.amount_subtotal ? session.amount_subtotal / 100 : undefined,
      },
      registrationId,
      parseInt(menteeId)
    );

    // 4. Create booking
    await createBookingService({
      menteeId: parseInt(menteeId),
      planId: parseInt(planId),
      registrationId,
    });

    // 5. Update slot status to Booked
    await updateSlotStatusService(parseInt(mentorId), slotStartTime, slotEndTime);

    // 6. Create meeting (requires invoiceId and registrationId)
    await createMeetingService(
      {
        menteeId: parseInt(menteeId),
        mentorId: parseInt(mentorId),
        slotStartTime,
        slotEndTime,
      },
      invoiceId,
      registrationId
    );

    // 7. Increment discount usage if discount was applied
    if (discountId) {
      await incrementDiscountUsageService(parseInt(discountId));
    }

    await transaction.commit();

    console.log(`Successfully processed checkout session: ${session.id}`);

    // 8. Send booking confirmation email (after transaction commit)
    if (envConfig.MAIL_SEND) {
      try {
        // Fetch user details for email
        const userDetailsResult = await pool
          .request()
          .input("menteeId", parseInt(menteeId))
          .input("mentorId", parseInt(mentorId))
          .input("planId", parseInt(planId)).query(`
          SELECT
            mentee.first_name + ' ' + mentee.last_name AS menteeName,
            mentee.email AS menteeEmail,
            mentor.first_name + ' ' + mentor.last_name AS mentorName,
            p.plan_type,
            p.plan_description
          FROM users mentee
          INNER JOIN users mentor ON mentor.user_id = @mentorId
          INNER JOIN plans p ON p.plan_id = @planId
          WHERE mentee.user_id = @menteeId
        `);

        if (userDetailsResult.recordset.length > 0) {
          const details = userDetailsResult.recordset[0];
          const startDateTime = new Date(slotStartTime);
          const endDateTime = new Date(slotEndTime);

          const emailData: BookingConfirmationData = {
            menteeName: details.menteeName,
            mentorName: details.mentorName,
            planType: details.plan_type,
            planDescription: details.plan_description,
            meetingDate: startDateTime.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            startTime: startDateTime.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            endTime: endDateTime.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            amount: ((session.amount_total || 0) / 100).toFixed(2),
            totalAmount: ((session.amount_total || 0) / 100).toFixed(2),
            ...(discountAmount > 0 && { discountAmount: discountAmount.toFixed(2) }),
            ...(message && { message }),
          };

          await sendBookingConfirmation(emailData, details.menteeEmail);
          console.log(`Booking confirmation email sent to: ${details.menteeEmail}`);
        }
      } catch (emailError) {
        // Log email error but don't fail the entire process
        console.error("Error sending booking confirmation email:", emailError);
      }
    }
  } catch (error) {
    await transaction.rollback();
    console.error("Error processing checkout session:", error);
    throw error;
  }
};

export {
  validateBookingService,
  createCheckoutSessionService,
  handleCheckoutSessionCompletedService,
  createInvoiceService,
  createPlanRegistrationService,
  createBookingService,
  updateSlotStatusService,
  createMeetingService,
  incrementDiscountUsageService,
};
