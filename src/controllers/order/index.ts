import { Request, Response } from "express";
import { orderModel } from "../../database";
import { countData, getData, responseMessage } from "../../helper";
import { apiResponse } from "../../common";
import { ObjectId } from 'mongodb';
import { reqInfo } from "../../helper/winston_logger";

let ObjectId = require('mongoose').Types.ObjectId;


export const createOrder = async (req, res) => {
    reqInfo(req)
    try {
        const body = req.body;
        const addorder = await orderModel.create(body);
        return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess('Order successfully'), addorder, {}));
    } catch (error) {
        return res.status(500).json({ success: false, message: responseMessage?.internalServerError, error });
    }
};


export const updateOrder = async (req, res) => {
    reqInfo(req)
    try {
        const { orderId } = req.body;
        const body = req.body;
        const updatedOrder = await orderModel.findOneAndUpdate({ _id: new ObjectId(orderId), isDeleted: false }, body, { new: true });
        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        res.status(200).json(
            new apiResponse(200, responseMessage.updateDataSuccess("Order updated"), updatedOrder, {}));
    } catch (error) {
        return res.status(500).json({ success: false, message: responseMessage?.internalServerError, error });
    }
};


export const getAllOrders = async (req, res) => {
    reqInfo(req);
    try {
        let { search, page, limit } = req.query, options: any = { lean: true }, criteria: any = { isDeleted: false };
        if (search) {
            criteria.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { price: { $regex: search, $options: 'i' } }
            ];
        }
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;

        if (page && limit) {
            options.skip = (parseInt(page) - 1) * parseInt(limit);
            options.limit = parseInt(limit);
        }

        const response = await getData(orderModel, criteria, {}, options);
        const totalCount = await countData(orderModel, criteria);

        const stateObj = {
            page: pageNum,
            limit: limitNum,
            page_limit: Math.ceil(totalCount / limitNum) || 1,
        };
        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('order'), { order_data: response, totalData: totalCount, state: stateObj }, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};


export const getOrderById = async (req, res) => {
    reqInfo(req)
    try {
        const { orderId } = req.params;
        const order = await orderModel.findOne({ _id: new ObjectId(orderId), isDeleted: false });
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });
        return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess('Order successfully'), order, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};


export const deleteOrder = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        const { orderId } = req.params;
        const deletedOrder = await orderModel.findOneAndUpdate({ _id: new ObjectId(orderId), isDeleted: false }, { isDeleted: true }, { new: true });
        if (!deletedOrder) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        return res.status(200).json(new apiResponse(200, responseMessage.deleteDataSuccess('Order successfully'), deletedOrder, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

