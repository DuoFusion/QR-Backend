
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { apiResponse } from "../../common";
import { responseMessage, sendEmail } from "../../helper";
import { userModel } from "../../database/models";
import jwt from "jsonwebtoken";
import { reqInfo } from "../../helper/winston_logger";
import { config } from "../../../config";

const JWT_TOKEN_SECRET = config.JWT_TOKEN_SECRET || "yourSecretKey";

export const signUp = async (req, res) => {
  reqInfo(req);
  try {
    const body = req.body;
    let existingUser = await userModel.findOne({ email: body?.email, isDeleted: false });

    if (existingUser)
      return res.status(409).json(new apiResponse(409, responseMessage?.alreadyEmail || "Email already exists", {}, {}));

    existingUser = await userModel.findOne({ phoneNumber: body?.phoneNumber, isDeleted: false });
    if (existingUser)
      return res.status(409).json(new apiResponse(409, "Phone number already exists", {}, {}));

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = await bcrypt.hash(body.password, salt);
    body.password = hashedPassword;

    const savedUser = await new userModel(body).save();
    if (!savedUser)
      return res.status(500).json(new apiResponse(500, responseMessage?.errorMail || "Error saving user", {}, {}));

    return res.status(200).json(new apiResponse(200, "User registered successfully", savedUser, {}));
  } catch (error) {
    console.error(error);
    return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError || "Internal server error", {}, error));
  }
};

export const login = async (req, res) => {
  reqInfo(req);
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email, isDeleted: false });
    if (!user) {
      return res.status(400).json(new apiResponse(400, "Invalid email", {}, {}));
    }

    if (user.isBlocked) {
      return res.status(403).json(new apiResponse(403, 'Your account is blocked', {}, {}));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json(new apiResponse(400, "Invalid password", {}, {}));
    }
    const token = jwt.sign(
      {
        _id: user._id,
        role: user.role
      },
      JWT_TOKEN_SECRET,
      {}
    );

    const responseData = {
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        userType: user.role || "user"
      }
    };

    return res.status(200).json(new apiResponse(200, "Login successful", responseData, {}));
  } catch (error) {
    return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError || "Internal server error", {}, error));
  }
};



export const forgot_password = async (req, res) => {
  let body = req.body,
    otpFlag = 1,
    otp = 0;
  reqInfo(req);

  try {
    body.isActive = true;
    const user = await userModel.findOne({
      email: body.email,
      isDeleted: false
    });
    if (!user) {
      return res.status(400).json(new apiResponse(400, responseMessage?.invalidEmail || "Invalid email", {}, {}));
    }

    while (otpFlag === 1) {
      otp = Math.floor(100000 + Math.random() * 900000);
      const isUsed = await userModel.findOne({ otp });
      if (!isUsed) otpFlag = 0;
    }
    const otpExpireTime = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await userModel.findOneAndUpdate(user._id, { otp, otpExpireTime });

    await sendEmail(user.email, "Password Reset OTP", `Your OTP is: ${otp}`);

    return res.status(200).json(new apiResponse(200, "OTP sent to email", {}, {}));
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError || "Server error", {}, error));
  }
};


export const verify_otp = async (req, res) => {
  reqInfo(req);
  try {
    const { email, otp } = req.body;
    const user = await userModel.findOne({ email, isDeleted: false });
    if (!user || user.otp !== Number(otp)) {
      return res.status(400).json(new apiResponse(400, responseMessage?.invalidOTP, {}, {}));
    }

    if (user.otpExpireTime && user.otpExpireTime < new Date()) {
      return res.status(400).json(new apiResponse(400, responseMessage?.expireOTP, {}, {}));
    }

    return res.status(200).json(new apiResponse(200, responseMessage?.OTPverified, {}, {}));
  } catch (error) {
    return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
  }
};


export const reset_password = async (req, res) => {
  reqInfo(req);
  try {
    const { email, newpassword } = req.body;

    const user = await userModel.findOne({ email, isDeleted: false });

    if (!user) {
      return res.status(400).json(new apiResponse(400, "Email not found", {}, {}));
    }

    const hashedpassword = await bcrypt.hash(newpassword, 10);

    await userModel.findOneAndUpdate({ _id: user._id }, {
      password: hashedpassword,
      otp: null,
      otpExpireTime: null
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    const responseData = {
      token,
      user: {
        email: user.email,
        phoneNumber: user.phoneNumber,
        userType: user.role || "user"
      }
    };

    return res.status(200).json(new apiResponse(200, "Password has been reset successfully", responseData, {}));
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json(new apiResponse(500, "Server error", {}, error));
  }
};



export const change_password = async (req, res) => {
  reqInfo(req);
  try {
    const { email, oldPassword, newPassword, confirmPassword } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json(new apiResponse(404, "Email not found.", {}, {}));
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json(new apiResponse(400, "Old password is incorrect.", {}, {}));
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json(new apiResponse(400, "New password and confirm password do not match.", {}, {}));
    }
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    user.confirmPassword = req.body.confirmPassword;


    await user.save();

    return res.status(200).json(new apiResponse(200, "Password changed successfully.", {}, {}));
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError || "Internal Server Error", {}, error));
  }
};

