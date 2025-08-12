import mongoose from "mongoose";

const InquiriesSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    message: { type: String, required: true },
    settingId: { type: mongoose.Schema.Types.ObjectId, ref: "settings" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true, versionKey: false });

export const InquiriesModel = mongoose.model("Inquiries", InquiriesSchema);
