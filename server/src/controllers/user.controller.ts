import { updateAvatarService, changePasswordService } from "@/services/user.service";
import { Request, Response } from "express";
import cloudinary from "@/config/cloudinary";
import { ChangePasswordSchema, TChangePasswordSchema } from "@/validation/change-password.schema";

const updateAvatar = async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.user_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - User not authenticated",
      });
    }

    // Check if avatar file is uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Avatar image is required",
      });
    }

    const userId = parseInt(req.user.user_id);
    const oldAvatarUrl = req.user.avatar_url;

    // Upload new avatar to Cloudinary
    const uploadResult = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: "user_avatars",
          public_id: `avatar_${userId}_${Date.now()}`,
          type: "upload",
          transformation: [
            { width: 400, height: 400, crop: "fill", gravity: "face" },
            { quality: "auto", fetch_format: "auto" },
          ],
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

    const avatarUrl = uploadResult.secure_url;

    // Update user avatar in database
    const result = await updateAvatarService(userId, avatarUrl);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    // Delete old avatar from Cloudinary if it exists and is from our storage
    if (oldAvatarUrl && oldAvatarUrl.includes("cloudinary.com")) {
      try {
        // Extract public_id from the URL
        const urlParts = oldAvatarUrl.split("/");
        const fileNameWithExt = urlParts[urlParts.length - 1];
        if (fileNameWithExt) {
          const fileName = fileNameWithExt.split(".")[0];
          const folderName = urlParts[urlParts.length - 2];
          const publicId = `${folderName}/${fileName}`;

          await cloudinary.uploader.destroy(publicId);
          console.log(`Old avatar deleted: ${publicId}`);
        }
      } catch (error) {
        console.error("Error deleting old avatar from Cloudinary:", error);
        // Continue even if deletion fails
      }
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        avatar_url: avatarUrl,
      },
    });
  } catch (error) {
    console.error("Error in updateAvatar controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const changePassword = async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.user_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - User not authenticated",
      });
    }

    const { oldPassword, newPassword } = req.body as TChangePasswordSchema;

    // Validate input
    const validate = await ChangePasswordSchema.safeParseAsync(req.body);
    if (!validate.success) {
      const errorsZod = validate.error.issues;
      const errors = errorsZod?.map((err) => `${err.message}: ${String(err.path[0])}`);
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        data: { errors },
      });
    }

    const userId = parseInt(req.user.user_id);

    // Call change password service
    const result = await changePasswordService(userId, oldPassword, newPassword);

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
    console.error("Error in changePassword controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export { updateAvatar, changePassword };
