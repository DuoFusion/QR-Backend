import { Request, Response } from "express";
import { InquiriesModel } from "../../database";
import { apiResponse } from "../../common";
import { countData, getData, responseMessage } from "../../helper";
import { reqInfo } from "../../helper/winston_logger";

let ObjectId = require('mongoose').Types.ObjectId;

export const addInquiry = async (req, res) => {
    reqInfo(req)
    try {
        const body = req.body;
        const newInquiry = await InquiriesModel.create(body);
        return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess("Inquiry"), newInquiry, {}));
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const updateInquiry = async (req, res) => {
    reqInfo(req)
    try {
        const { inquiryId } = req.body;
        const body = req.body;
        const updatedInquiry = await InquiriesModel.findOneAndUpdate({ _id: new ObjectId(inquiryId) }, body, { new: true });
        if (!updatedInquiry) { return res.status(404).json({ success: false, message: "Inquiry not found" }); }
        res.status(200).json(new apiResponse(200, responseMessage.updateDataSuccess("inquiry"), updatedInquiry, {}));
    } catch (error: any) {
        res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getInquiryById = async (req, res) => {
    try {
        const { inquiryId } = req.params;
        const inquiry = await InquiriesModel.findOne({ _id: new ObjectId(inquiryId) });
        if (!inquiry) { return res.status(404).json({ success: false, message: "Inquiry not found", }); }

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess("Inquiry"), inquiry, {}));
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};


export const getAllInquiries = async (req, res) => {
    reqInfo(req);
    try {
        let { type, search, page, limit } = req.query, options: any = { lean: true }, criteria: any = { isDeleted: false };
        if (type) criteria.type = type;
        if (search) {
            criteria.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { message: { $regex: search, $options: 'i' } }
            ];
        }
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;

        if (page && limit) {
            options.skip = (parseInt(page) - 1) * parseInt(limit);
            options.limit = parseInt(limit);
            options.sort = { createdAt: -1 };
        }


        let response = await getData(InquiriesModel, criteria, {}, options);
        response = await InquiriesModel.populate(response, { path: 'userId', select: 'firstName lastName email phoneNumber' }); const totalCount = await countData(InquiriesModel, criteria);

        const stateObj = {
            page: pageNum,
            limit: limitNum,
            page_limit: Math.ceil(totalCount / limitNum) || 1,
        };
        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('inquiries'), { product_data: response, totalData: totalCount, state: stateObj }, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};


export const deleteInquiry = async (req, res) => {
    reqInfo(req)
    try {
        const { inquiryId } = req.params;
        const inquiry = await InquiriesModel.findOneAndUpdate({ _id: new ObjectId(inquiryId), isDeleted: false }, { isDeleted: true }, { new: true });
        if (!inquiry) {
            return res.status(404).json({ success: false, message: "Inquiry not found or already deleted" });
        }
        return res.status(200).json(new apiResponse(200, responseMessage.deleteDataSuccess("Inquiry"), inquiry, {}));
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};
