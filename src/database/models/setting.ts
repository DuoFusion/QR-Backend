import { required } from "joi";
import mongoose from "mongoose";

const settingSchema = new mongoose.Schema({
    logoImage: { type: String, required: true },
    title: { type: String, required: true },
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
    backgroundColor: { type: String },
    bannerImage: { type: String },

    primary: { type: String, required: true },
    secondary: { type: String, required: true },

    userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    isDeleted: { type: Boolean, default: false }

}, { timestamps: true, versionKey: false });

export const settingModel = mongoose.model("setting", settingSchema);