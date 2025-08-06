import mongoose from "mongoose";
import { ADMIN_ROLES } from "../../common";

const usersSchema = new mongoose.Schema({

    firstName: { type: String },
    lastName: { type: String },
    phoneNumber: { type: String, unique: true },
    email: { type: String, unique: true },
    
    
    address: { type: String },
    type: { type: String },
    link: { type: String },
    role: { type: String, enum: ADMIN_ROLES, default: 'user' },
    password: { type: String, required: true },
    confirmPassword: { type: String },

    otp: { type: Number, default: null },
    otpExpireTime: { type: Date, default: null },
    isEmailVerified: { type: Boolean, default: false },

    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },

}, { timestamps: true, versionKey: false });

export const userModel = mongoose.model("users", usersSchema);
