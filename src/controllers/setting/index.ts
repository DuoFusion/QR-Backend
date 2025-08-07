import { settingModel, userModel } from "../../database/models";
import { Request, Response } from "express";
import { countData, createData, getData, responseMessage, updateData } from "../../helper";
import { apiResponse } from "../../common";
import QRCode from "qrcode";
import path from "path";
import fs from 'fs';
import { config } from "../../../config";
import { reqInfo } from "../../helper/winston_logger";

let ObjectId = require('mongoose').Types.ObjectId;

export const addsetting = async (req, res) => {
  reqInfo(req)
  try {
    const body = req.body;
    const user = await userModel.findOne({ _id: new ObjectId(body.userId), isDeleted: false });
    if (!user) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("user"), {}, {}));
    
    if (body.qrlink) {
      const qrCodeBase64 = await QRCode.toDataURL(body.qrlink);
      const base64Data = qrCodeBase64.replace(/^data:image\/png;base64,/, "");
      const fileName = `qr_${Date.now()}.png`;
      const uploadDir = path.join(__dirname, "../../../../uploads");
      const filePath = path.join(uploadDir, fileName);

      fs.mkdirSync(uploadDir, { recursive: true });
      fs.writeFileSync(filePath, base64Data, "base64");

      const publicUrl = `${config.BACKEND_URL}/uploads/${fileName}`;
      body.qrCode = publicUrl;
    }
    const response = await settingModel.create(body);

    return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess('setting data is successfully'), response, {}));
  } catch (error) {
    console.error(error);
    return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
  }
};

export const updatesetting = async (req: Request, res: Response) => {
  reqInfo(req);
  try {
    const { settingId, ...body } = req.body;

    if (!settingId) {
      return res.status(400).json(new apiResponse(400, "setting ID is required", {}, {}));
    }

    const isExist = await settingModel.findOne({ _id: new ObjectId(settingId), isDeleted: false });
    if (!isExist) {
      return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound("setting"), {}, {}));
    }

    if (body.qrlink) {
      // Delete old QR file
      const oldFileNameMatch = isExist.qrCode?.match(/qr_(\d+)\.png/);
      if (oldFileNameMatch) {
        const oldFileName = `qr_${oldFileNameMatch[1]}.png`;
        const oldFilePath = path.join(__dirname, "../../../../uploads", oldFileName);
        if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
      }

      // Generate new QR code
      const qrCodeBase64 = await QRCode.toDataURL(body.qrlink);
      const base64Data = qrCodeBase64.replace(/^data:image\/png;base64,/, "");

      const fileName = `qr_${Date.now()}.png`;
      const filePath = path.join(__dirname, "../../../../uploads", fileName);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, base64Data, "base64");

      const publicUrl = `${config.BACKEND_URL}/uploads/${fileName}`;
      body.qrCode = publicUrl;
    }

    const response = await updateData(settingModel, { _id: new ObjectId(settingId) }, body, {});
    if (!response) {
      return res.status(404).json(new apiResponse(404, "setting not found", {}, {}));
    }

    return res.status(200).json(new apiResponse(200, responseMessage.updateDataSuccess("setting data is updated"), response, {}));
  } catch (error) {
    console.error(error);
    return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
  }
};


export const getsettingById = async (req, res) => {
  reqInfo(req)
  try {
    const { settingId } = req.params;
    const setting = await settingModel.findOne({ _id: new ObjectId(settingId), isDeleted: false });
    if (!setting) {
      return res.status(404).json({ success: false, message: "setting not found", });
    }
    return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess("setting fetched successfully"), setting, {}));
  } catch (error) {
    return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
  }
};

export const getAllsetting = async (req, res) => {
  reqInfo(req);
  try {
    let { search, page, limit } = req.query, options: any = { lean: true }, criteria: any = { isDeleted: false };
    if (search) {
      criteria.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } }
      ];
    }
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 1;

    if (page && limit) {
      options.skip = (parseInt(page) - 1) * parseInt(limit);
      options.limit = parseInt(limit);
    }

    const response = await getData(settingModel, criteria, {}, options);
    const totalCount = await countData(settingModel, criteria);

    const stateObj = {
      page: pageNum,
      limit: limitNum,
      page_limit: Math.ceil(totalCount / limitNum) || 1,
    };

    return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('setting'), { setting_data: response, totalData: totalCount, state: stateObj }, {}));
  } catch (error) {
    console.log(error);
    return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
  }
};


export const deletesettingById = async (req, res) => {
  reqInfo(req)
  try {
    const { settingId } = req.params;
    const deletedsetting = await settingModel.findOneAndUpdate({ _id: new ObjectId(settingId), isDeleted: false },
      { isDeleted: true, deletedAt: new Date() }, { new: true }
    );
    if (!deletedsetting) {
      return res.status(404).json({ success: false, message: "setting not found or already deleted", });
    }
    return res.status(200).json(new apiResponse(200, responseMessage.deleteDataSuccess("setting"), deletedsetting, {}));
  } catch (error) {
    return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
  }
};