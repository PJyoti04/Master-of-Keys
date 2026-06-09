import imagekit from "../config/imageKit.js";
import User from "../models/User.js";

const getAuthParamsForUpload = (req, res) => {
  const authParams = imagekit.helper.getAuthenticationParameters();

  res
    .status(200)
    .json({ ...authParams, publicKey: process.env.IMAGEKIT_PUBLIC_KEY });
};

const updateProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;

    const { avatarUrl, fileId } = req.body;

    if (!avatarUrl || !fileId) {
      return res.status(400).json({
        success: false,
        message: "Avatar URL and fileId are required",
      });
    }

    // Get existing user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete previous image from ImageKit
    await deleteOldProfilePicture(user?.profile?.fileId);

    // Save new image metadata
    user.profile.avatarUrl = avatarUrl;
    user.profile.fileId = fileId;

    await user.save();

    const updatedUser = await User.findById(userId).select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile picture updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Profile update error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update profile picture",
    });
  }
};

const deleteOldProfilePicture = async (fileId) => {
  if (!fileId) return;

  try {
    await imagekit.files.delete(fileId);
    // console.log(`Deleted old profile picture: ${fileId}`);
  } catch (error) {
    console.error("Failed to delete old ImageKit file:", error.message);
  }
};

const removeProfileAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete image from ImageKit
    await deleteOldProfilePicture(user?.profile?.fileId);

    user.profile = {
      avatarUrl: null,
      fileId: null,
    };

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile photo removed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to remove profile photo",
    });
  }
};

export { getAuthParamsForUpload, updateProfilePicture, removeProfileAvatar };
