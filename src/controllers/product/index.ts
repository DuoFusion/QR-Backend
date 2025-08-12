import { Request, Response } from 'express';
import { productModel } from '../../database/models';
import { ADMIN_ROLES, apiResponse } from '../../common';
import { countData, createData, getData, responseMessage } from '../../helper';
import mongoose from 'mongoose';
import { reqInfo } from '../../helper/winston_logger';

let ObjectId = require('mongoose').Types.ObjectId;

export const addProduct = async (req, res) => {
  reqInfo(req)
  try {
    const body = req.body;
    const response = await productModel.create(body);
    return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess('Product added successfully!'), response, {}));
  } catch (error) {
    console.error(error);
    return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error)
    );
  }
};

export const updateProductById = async (req, res) => {
  reqInfo(req)
  try {
    const { productId } = req.body;
    const body = req.body;
    const updatedProduct = await productModel.findOneAndUpdate({ _id: new ObjectId(productId), isDeleted: false }, body, { new: true });
    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    return res.status(200).json(new apiResponse(200, responseMessage.updateDataSuccess('Product added successfully!'), updatedProduct, {}));
  } catch (error) {
    console.error(error);
    return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error)
    );
  };
}


export const getProductById = async (req, res) => {
  reqInfo(req)
  try {
    const { productId } = req.params;
    const product = await productModel.findOne({ _id: new ObjectId(productId), isDeleted: false }).populate('userId', 'firstName lastName email phoneNumber').populate('settingId', 'logoImage title content email phoneNumber address qrCode backgroundColor bannerImage');
    if (!product) {
      return res.status(404).json({ success: false, message: "product is not found", });
    }
    return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Product added successfully!'), product, {}));
  } catch (error) {
    console.error(error);
    return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error)
    );
  }
};

export const get_all_users = async (req, res) => {
  reqInfo(req);
  try {
    let { type, search, page, limit, userFilter, settingFilter } = req.query;
    let options: any = { lean: true };
    let criteria: any = { isDeleted: false };

    if (type) criteria.type = type;

    if (userFilter) criteria.userId = new ObjectId(userFilter);
    if (settingFilter) criteria.settingId = new ObjectId(settingFilter);

    if (search) {
      const regex = new RegExp(search, 'i');
      criteria.$or = [
        { name: { $regex: regex } },
        { description: { $regex: regex } },
        { category: { $regex: regex } },
        { price: { $regex: regex } }
      ];
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    if (page && limit) {
      options.skip = (pageNum - 1) * limitNum;
      options.limit = limitNum;
      options.sort = { createdAt: -1 };
    }

    let response = await productModel
      .find(criteria, {}, options).populate({
        path: 'userId',
        select: 'firstName lastName email phoneNumber',
      }).populate('settingId', 'logoImage title content email phoneNumber address qrCode backgroundColor bannerImage')
      .lean();

    if (search) {
      response = response.filter(item => item.userId !== null);
    }

    const totalCount = await countData(productModel, criteria);

    const stateObj = {
      page: pageNum,
      limit: limitNum,
      page_limit: Math.ceil(totalCount / limitNum) || 1
    };

    return res.status(200).json(
      new apiResponse(
        200,
        responseMessage.getDataSuccess('product'),
        { product_data: response, totalData: totalCount, state: stateObj },
        {}
      )
    );
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new apiResponse(500, responseMessage.internalServerError, {}, error));
  }
};



export const deleteProductById = async (req, res) => {
  reqInfo(req)
  try {
    const { productId } = req.params;

    const deletedproduct = await productModel.findOneAndUpdate({ _id: new ObjectId(productId), isDeleted: false },
      { isDeleted: true, deletedAt: new Date() }, { new: true }
    );
    if (!deletedproduct) {
      return res.status(404).json({ success: false, message: "product not found or already deleted", });
    }
    return res.status(200).json(new apiResponse(200, responseMessage.deleteDataSuccess("product"), deletedproduct, {}));
  } catch (error) {
    return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
  }
};