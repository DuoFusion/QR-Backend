import { required } from "joi";
import mongoose from "mongoose";

const settingSchema = new mongoose.Schema({
    logoImage: { type: String },
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
    address: { type: String },
    qrCode: { type: String },
    settingImage: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    isDeleted: { type: Boolean, default: false }

}, { timestamps: true, versionKey: false });

export const settingModel = mongoose.model("setting", settingSchema);