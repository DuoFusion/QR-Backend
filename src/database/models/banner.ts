import { required } from "joi";
import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
    image: { type: String },
    title: { type: String },
    content: { type: String },
    socialLinks: {
        whatsapp: { type: String },
        instagram: { type: String },
        facebook: { type: String },
        location: { type: String },
    },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    qrCode: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    isDeleted: { type: Boolean, default: false }

}, { timestamps: true, versionKey: false });

export const bannerModel = mongoose.model("Banner", bannerSchema);