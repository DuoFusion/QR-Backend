import { required } from "joi";
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, },
    address: { type: String, },
    paymentMethod: { type: String },
    price: { type: String },
    isDeleted: { type: Boolean, default: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" }

}, { timestamps: true, versionKey: false });

export const orderModel = mongoose.model("Order", orderSchema);
