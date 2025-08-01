import jwt from 'jsonwebtoken'
import { apiResponse } from '../common'
import { Request, Response } from 'express'
import { config } from '../../config'
import { responseMessage } from './responce'
import { userModel } from '../database'

const ObjectId = require('mongoose').Types.ObjectId
const jwt_token_secret = config.JWT_TOKEN_SECRET;

export const adminJWT = async (req, res, next) => {
    let { authorization } = req.headers,
        result: any
    // console.log("authorization", authorization);

    if (authorization) {
        try {
            // console.log("jwt_token_secret => ",jwt_token_secret)
            let isVerifyToken = jwt.verify(authorization, jwt_token_secret)
            // console.log("isVerifyToken => ",isVerifyToken)
            // console.log("isVerifyToken.authorization", authorization);
            // console.log("jwt_token_secret", jwt_token_secret);
            result = await userModel.findOne({ _id: new ObjectId(isVerifyToken._id), isDeleted: false }).lean()
            // console.log("result => ",result)
            if (result?.isBlocked == true) return res.status(410).json(new apiResponse(410, responseMessage?.accountBlock, {}, {}));
            if (result?.isDeleted == false) {
                req.headers.user = result
                return next()
            } else {
                return res.status(401).json(new apiResponse(401, responseMessage?.invalidToken, {}, {}))
            }
        } catch (err) {
            console.log(err)
            if (err.message == "invalid signature") return res.status(403).json(new apiResponse(403, responseMessage?.differentToken, {}, {}))
            return res.status(401).json(new apiResponse(401, responseMessage.invalidToken, {}, {}))
        }
    } else {
        return res.status(401).json(new apiResponse(401, responseMessage?.tokenNotFound, {}, {}))
    }
}
