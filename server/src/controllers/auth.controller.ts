import { verifyMail, verifyResetPassword } from "@/mailtrap/mailSend";
import {
  loginUserService,
  registerUserService,
  registerMentorService,
  verifyOTPService,
  forgotPasswordService,
  resetPasswordService,
  updateUserStatusService,
  resendOTPService,
} from "@/services/auth.service";
import { generateTokenAndSetCookie } from "@/utils/generateTokenAndSetCookie";
import { LoginSchema, TLoginSchema } from "@/validation/login.schema";
import { RegisterSchema, TRegisterSchema, ResetPasswordSchema } from "@/validation/register.schema";
import { Request, Response } from "express";
import envConfig from "@/config/env";
import { Status } from "@/constants/type";
import cloudinary from "@/config/cloudinary";

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

    if (envConfig.MAIL_SEND) {
      await verifyMail(user.otp!, user.email);
    } else {
      console.log("Email verification is disabled; skipping OTP email.");
    }

    return res.status(201).json({ success: true, message: "User registered successfully" });
  } catch (error) {
    console.error("Error in registerUser controller:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const registerMentor = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password } = req.body as TRegisterSchema;

    // Validate input
    const validate = await RegisterSchema.safeParseAsync(req.body);

    if (!validate.success) {
      const errorsZod = validate.error.issues;
      const errors = errorsZod?.map((err) => `${err.message}: ${String(err.path[0])}`);
      const oldData = { firstName, lastName, email, password };
      return res.status(400).json({ success: false, message: "Validation errors", data: { errors, oldData } });
    }

    // Check if CV file is uploaded
    if (!req.file) {
      return res.status(400).json({ success: false, message: "CV file is required" });
    }

    // Check if the uploaded file is a PDF
    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ success: false, message: "Only PDF files are allowed for CV" });
    }

    // Upload CV to Cloudinary
    const uploadResult = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
          folder: "mentor_cvs",
          public_id: `cv_${email.replace(/[@.]/g, "_")}_${Date.now()}`,
          type: "upload",
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(error);
          } else {
            console.log("Cloudinary upload success:", result?.secure_url);
            console.log("Public ID:", result?.public_id);
            resolve(result as { secure_url: string; public_id: string });
          }
        }
      );
      uploadStream.end(req.file!.buffer);
    });

    const cvUrl = uploadResult.secure_url;

    // Register mentor with CV URL
    const user = await registerMentorService(firstName, lastName, email, password, cvUrl);

    if (envConfig.MAIL_SEND) {
      await verifyMail(user.otp!, user.email);
    } else {
      console.log("Email verification is disabled; skipping OTP email.");
    }

    return res.status(201).json({
      success: true,
      message: "Mentor registered successfully. Please verify your email. Your account will be reviewed by our team.",
    });
  } catch (error) {
    console.error("Error in registerMentor controller:", error);
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

const logoutUser = async (req: Request, res: Response) => {
  try {
    // Update user status to Inactive if user is logged in
    if (req.user && req.user.user_id) {
      await updateUserStatusService(parseInt(req.user.user_id), Status.Inactive);
    }

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    return res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in logoutUser controller:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body as { email: string };

    // Call forgot password service
    const result = await forgotPasswordService(email);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message,
      });
    }

    // Send reset password email
    const resetURL = `${envConfig.CLIENT_URL}/reset-password/${result.resetToken}`;
    await verifyResetPassword(resetURL, result.email!);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Error in forgotPassword controller:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    // Check if token exists
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Reset token is required",
      });
    }

    // Validate token and password
    const validate = await ResetPasswordSchema.safeParseAsync({ token, newPassword });
    if (!validate.success) {
      const errorsZod = validate.error.issues;
      const errors = errorsZod?.map((err) => `${err.message}: ${String(err.path[0])}`);
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        data: { errors },
      });
    }

    // Call reset password service
    const result = await resetPasswordService(token, newPassword);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Error in resetPassword controller:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getMe = (req: Request, res: Response) => {
  try {
    res.json({ success: true, message: "User info retrieved successfully", data: { user: req.user } });
  } catch (error) {
    console.error("Error getting user info:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const resendOTP = async (req: Request, res: Response) => {
  try {
    const { email } = req.body as { email: string };

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Call resend OTP service
    const result = await resendOTPService(email);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    // Send OTP email
    if (result.email && result.newOtp) {
      await verifyMail(result.newOtp, result.email);
    }

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Error in resendOTP controller:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export {
  registerUser,
  verifyOTP,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  getMe,
  registerMentor,
  resendOTP,
};
