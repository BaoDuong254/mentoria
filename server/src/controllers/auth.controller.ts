import { verifyMail } from "@/mailtrap/verify-otp";
import { loginUserService, registerUserService, verifyOTPService } from "@/services/auth.service";
import { generateTokenAndSetCookie } from "@/utils/generateTokenAndSetCookie";
import { LoginSchema, TLoginSchema } from "@/validation/login.schema";
import { RegisterSchema, TRegisterSchema } from "@/validation/register.schema";
import { Request, Response } from "express";

const registerUser = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password } = req.body as TRegisterSchema;
    const validate = await RegisterSchema.safeParseAsync(req.body);
    if (!validate.success) {
      const errorsZod = validate.error.issues;
      const errors = errorsZod?.map((err) => `${err.message}: ${String(err.path[0])}`);
      const oldData = { firstName, lastName, email, password };
      return res.status(400).json({ success: false, message: "Validation errors", data: { errors, oldData } });
    }
    const user = await registerUserService(firstName, lastName, email, password);
    await verifyMail(user.otp!, user.email);
    return res.status(201).json({ success: true, message: "User registered successfully" });
  } catch (error) {
    console.error("Error in registerUser controller:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const verifyOTP = async (req: Request, res: Response) => {
  const { otp } = req.body as { otp: string };
  try {
    const result = await verifyOTPService(otp);

    if (!result.success) {
      // If OTP expired and needs resend, send email with new OTP
      if (result.needResend && result.email && result.newOtp) {
        await verifyMail(result.newOtp, result.email);
      }
      return res.status(400).json({ success: false, message: result.message });
    }

    // Generate token and set cookie when verification is successful
    if (result.user) {
      const payload = {
        userId: result.user.user_id.toString(),
        userRole: result.user.role,
        userStatus: result.user.status,
      };
      generateTokenAndSetCookie(res, payload);
    }

    return res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    console.error("Error in verifyOTP controller:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as TLoginSchema;

    // Validate input
    const validate = await LoginSchema.safeParseAsync(req.body);
    if (!validate.success) {
      const errorsZod = validate.error.issues;
      const errors = errorsZod?.map((err) => `${err.message}: ${String(err.path[0])}`);
      const oldData = { email, password: "" };
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        data: { errors, oldData },
      });
    }

    // Call login service
    const result = await loginUserService(email, password);

    if (!result.success) {
      // If user needs email verification, send new OTP
      if (result.needVerification && result.userEmail && result.newOtp) {
        await verifyMail(result.newOtp, result.userEmail);
      }
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    // Generate token and set cookie when login is successful
    if (result.user) {
      const payload = {
        userId: result.user.user_id.toString(),
        userRole: result.user.role,
        userStatus: result.user.status,
      };
      generateTokenAndSetCookie(res, payload);
    }

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Error in loginUser controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export { registerUser, verifyOTP, loginUser };
