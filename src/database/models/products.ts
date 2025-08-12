import mongoose from "mongoose";

const productsSchema = new mongoose.Schema({

    image: { type: String, required: true },
    name: { type: String },
    description: { type: String },
    price: { type: String },
    category: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    settingId: { type: mongoose.Schema.Types.ObjectId, ref: "setting" },
    isDeleted: { type: Boolean, default: false }

}, { timestamps: true, versionKey: false });

export const productModel = mongoose.model("Products", productsSchema);