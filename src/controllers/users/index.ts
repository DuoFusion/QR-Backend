import { userModel } from "../../database/models/users";
import { apiResponse } from "../../common";
import { countData, getData, responseMessage } from "../../helper";
import { ADMIN_ROLES } from "../../common";
import bcrypt from 'bcrypt';
import { reqInfo } from "../../helper/winston_logger";

let ObjectId = require("mongoose").Types.ObjectId;

export const add_user = async (req, res) => {
  reqInfo(req);
  try {
    const body = req.body;

    const existingEmail = await userModel.findOne({ email: body.email, isDeleted: false });
    if (existingEmail)
      return res.status(409).json(new apiResponse(409, responseMessage.dataAlreadyExist("email"), {}, {}));

    const existingPhone = await userModel.findOne({ phoneNumber: body.phoneNumber, isDeleted: false });
    if (existingPhone)
      return res.status(409).json(new apiResponse(409, responseMessage.dataAlreadyExist("phoneNumber"), {}, {}));

    req.body.confirmPassword = req.body.password;


    const saltRounds = 10;
    body.password = await bcrypt.hash(body.password, saltRounds);

    // Ensure confirmPassword matches password

    body.role = ADMIN_ROLES.USER;

    const user = await new userModel(body).save();
    console.log("User added successfully:", user);
    if (!user)
      return res.status(500).json(new apiResponse(500, responseMessage.addDataError, {}, {}));

    return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess("user"), user, {}));
  } catch (error) {
    console.error("Add User Error:", error);
    return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
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
    let { search, page, limit } = req.query, options: any = { lean: true }, criteria: any = { isDeleted: false };
    if (search) {
      criteria.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } }
      ];
    }
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 1;

    if (page && limit) {
      options.skip = (parseInt(page) - 1) * parseInt(limit);
      options.limit = parseInt(limit);
    }

    const response = await getData(userModel, criteria, {}, options);
    const totalCount = await countData(userModel, criteria);

    const stateObj = {
      page: pageNum,
      limit: limitNum,
      page_limit: Math.ceil(totalCount / limitNum) || 1,
    };

    return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Users'), { User_data: response, totalData: totalCount, state: stateObj }, {}));
  } catch (error) {
    console.log(error);
    return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
  }
};


export const delete_user = async (req, res) => {
  reqInfo(req);
  try {
    const { userId } = req.params;
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
    const { userId } = req.params;
    const user = await userModel.findOne({ _id: new ObjectId(userId), isDeleted: false });
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

