import express from "express";
import { InquiryController } from "../controllers";

const router = express.Router();

// Routes
router.post("/add",InquiryController.addInquiry);
router.post("/update",InquiryController.updateInquiry);
router.delete("/delete/:InquiryId",InquiryController.deleteInquiry);

router.get("/",InquiryController.getAllInquiries);
router.get("/:InquiryId",InquiryController.getInquiryById);

export default router