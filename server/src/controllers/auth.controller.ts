import { registerUserService } from "@/services/auth.service";
import { generateTokenAndSetCookie } from "@/utils/generateTokenAndSetCookie";
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
    generateTokenAndSetCookie(res, user.user_id.toString());
    return res.status(201).json({ success: true, message: "User registered successfully" });
  } catch (error) {
    console.error("Error in registerUser controller:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export { registerUser };
