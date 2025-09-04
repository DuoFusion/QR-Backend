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
    let { type, search, page, limit, userFilter, settingFilter, weburl } = req.query;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    // 🟢 Base match
    let match: any = { isDeleted: false };
    if (type) match.type = type;
    if (userFilter) match.userId = new ObjectId(userFilter);

    if (search) {
      const regex = new RegExp(search, "i");
      match.$or = [
        { name: { $regex: regex } },
        { description: { $regex: regex } },
        { category: { $regex: regex } },
        { price: { $regex: regex } },
      ];
    }

    // 🟢 Base pipeline
    let pipeline: any[] = [
      { $match: match },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userId",
        },
      },
      { $unwind: { path: "$userId", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "settings",
          localField: "settingId",
          foreignField: "_id",
          as: "settingId",
        },
      },
      { $unwind: { path: "$settingId", preserveNullAndEmptyArrays: true } },
    ];

    // 🟢 settingFilter + weburl condition
    if (settingFilter && weburl) {
      if (ObjectId.isValid(settingFilter)) {
        pipeline.push({
          $match: {
            "settingId._id": new ObjectId(settingFilter),
            "settingId.weburl": weburl,
          },
        });
      } else {
        if (settingFilter === weburl) {
          pipeline.push({ $match: { "settingId.weburl": weburl } });
        }
      }
    } else if (settingFilter) {
      if (ObjectId.isValid(settingFilter)) {
        pipeline.push({ $match: { "settingId._id": new ObjectId(settingFilter) } });
      } else {
        pipeline.push({ $match: { "settingId.weburl": settingFilter } });
      }
    } else if (weburl) {
      pipeline.push({ $match: { "settingId.weburl": weburl } });
    }

    // 🟢 Sorting + Pagination
    const paginatedPipeline = [
      ...pipeline,
      { $sort: { createdAt: -1 } },
      { $skip: (pageNum - 1) * limitNum },
      { $limit: limitNum },
      {
        $project: {name: 1,description: 1,category: 1,price: 1,createdAt: 1,
          userId: {
            firstName: 1,
            lastName: 1,
            email: 1,
            phoneNumber: 1,
          },
          settingId: {logoImage: 1,title: 1,content: 1,email: 1,phoneNumber: 1,address: 1,qrCode: 1,backgroundColor: 1,bannerImage: 1,weburl: 1,
          },
        },
      },
    ];

    const response = await productModel.aggregate(paginatedPipeline);
    let countPipeline = [
      ...pipeline,
      { $count: "total" }
    ];
    const countResult = await productModel.aggregate(countPipeline);
    const totalCount = countResult.length > 0 ? countResult[0].total : 0;

      const stateObj = {
      page: pageNum,
      limit: limitNum,
      page_limit: Math.ceil(totalCount / limitNum) || 1,
    };

    return res.status(200).json(
      new apiResponse(
        200,
        responseMessage.getDataSuccess("product"),
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