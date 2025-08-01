import QRCode from "qrcode";
import { userModel } from "../../database/models/users";
import { apiResponse } from "../../common";
import { Request, Response } from "express";
import { countData, getData, responseMessage } from "../../helper";
import { ADMIN_ROLES } from "../../common";
import bcrypt from 'bcrypt';
import mongoose from "mongoose";
import { reqInfo } from "../../helper/winston_logger";
import { object } from "joi";

let ObjectId = require("mongoose").Types.ObjectId;

export const add_user = async (req, res) => {
  reqInfo(req)
  try {
    const body = req.body;

    const userEmail = await userModel.findOne({ email: body.email, isDeleted: false });
    if (userEmail) {
      return res.status(409).json(new apiResponse(409, responseMessage?.alreadyEmail || "Email already registered", {}, {})
      );
    }
    const userPhone = await userModel.findOne({ phoneNumber: body.phoneNumber, isDeleted: false });
    if (userPhone) {
      return res.status(409).json(new apiResponse(409, "Phone number already registered", {}, {}));
    }
    if (!body.role) {
      body.role = ADMIN_ROLES.USER;
    }
    body.confirmPassword = body.password
    if (body.password) {
      const salt = await bcrypt.genSalt(10);
      body.password = await bcrypt.hash(body.password, salt);
    }

    const newUser = new userModel({ ...body });
    const result = await newUser.save();

    const responseData = {
      userType: body.role,
      ...result.toObject(),
    };

    return res.status(200).json(new apiResponse(200, "User added successfully", responseData, {}));
  } catch (error) {
    console.error("Add user error:", error);
    return res.status(500).json(
      new apiResponse(500, responseMessage?.internalServerError || "Internal server error", {}, error)
    );
  }
};



export const update_user = async (req, res) => {
  reqInfo(req);
  try {
    const { userId, email, phoneNumber, password } = req.body;

    const user = await userModel.findOne({ _id: new ObjectId(userId), isDeleted: false });
    if (!user)
      return res.status(404).json(new apiResponse(404, "User not found", {}, {}));

    const role = await userModel.findOne({ name: ADMIN_ROLES.USER, isDeleted: false });
    const roleId = new ObjectId(role?._id);

    const emailExist = await userModel.findOne({ email, roleId, isDeleted: false, _id: { $ne: user._id } });
    if (emailExist)
      return res.status(409).json(new apiResponse(409, responseMessage.dataAlreadyExist("email"), {}, {}));

    const phoneExist = await userModel.findOne({
      phoneNumber, roleId, isDeleted: false, _id: { $ne: user._id }
    });
    if (phoneExist)
      return res.status(409).json(new apiResponse(409, responseMessage.dataAlreadyExist("phoneNumber"), {}, {}));

    req.body.roleId = roleId;
    if (password) {
      const saltRounds = 10;
      req.body.password = await bcrypt.hash(password, saltRounds);
    }
    const updatedUser = await userModel.findOneAndUpdate({ _id: new ObjectId(userId) }, req.body, { new: true });

    if (!updatedUser)
      return res.status(404).json(new apiResponse(404, responseMessage.updateDataError("user"), {}, {}));

    return res.status(200).json(new apiResponse(200, responseMessage.updateDataSuccess("user"), updatedUser, {}));
  } catch (error) {
    console.error("Edit User Error:", error);
    return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
  }
};


export const get_all_users = async (req, res) => {
  reqInfo(req);
  try {
    let { page, limit, search } = req.query as any;
    const criteria: any = { role: ADMIN_ROLES.USER, isDeleted: false };
    const options: any = { lean: true, sort: { createdAt: -1 } };

    const userHeader = req.headers?.user ? JSON.parse(req.headers.user as string) : null;

    if (userHeader?.role === ADMIN_ROLES.USER) {
      criteria._id = new ObjectId(userHeader._id);
    }
    if (search) {
      const regex = new RegExp(search, 'i');
      criteria.$or = [
        { firstName: { $regex: regex } },
        { lastName: { $regex: regex } },
        { phoneNumber: { $regex: regex } },
      ];
    }

    const pageNumber = parseInt(page) || 1;
    const pageLimit = parseInt(limit) || 10;

    options.skip = (pageNumber - 1) * pageLimit;
    options.limit = pageLimit;

    const users = await getData(userModel, criteria, {}, options);
    const totalCount = await countData(userModel, criteria);

    const stateObj = {
      page: pageNumber,
      limit: pageLimit,
      page_limit: Math.ceil(totalCount / pageLimit),
    };

    return res.status(200).json(
      new apiResponse(200, responseMessage.getDataSuccess('User'), {
        user_data: users,
        totalData: totalCount,
        state: stateObj
      }, {})
    );
  } catch (error) {
    console.error("Get All Users Error:", error);
    return res.status(500).json(
      new apiResponse(500, responseMessage.internalServerError, {}, error)
    );
  }
};


export const delete_user = async (req, res) => {
  reqInfo(req);
  try {
    const userId = req.params;
    const user = await userModel.findOneAndUpdate({ _id: new ObjectId(userId), isDeleted: false }, { isDeleted: true }, { new: true });
    if (!user) return res.status(404).json(new apiResponse(404, "User not found", {}, {}));

    return res.status(200).json(new apiResponse(200, "User deleted successfully", user, {}));
  } catch (error) {
    console.log(error);
    return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
  }
};


export const getUserById = async (req, res) => {
  reqInfo(req)
  try {
    const { id } = req.params;
    const user = await userModel.findOne({ _id: id, isDeleted: false });
    if (!user) {
      return res.status(404).json(new apiResponse(404, "User not found", {}, {}));
    }
    return res.status(200).json(new apiResponse(200, "User fetched successfully", user, {}));
  } catch (error) {
    console.error("Get user by ID error:", error);
    return res.status(500).json(
      new apiResponse(500, responseMessage?.internalServerError || "Internal Server Error", {}, error)
    );
  }
};

