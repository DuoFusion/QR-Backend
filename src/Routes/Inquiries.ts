import express from "express";
import { InquiryController } from "../controllers";
import { adminJWT } from "../helper/jwt";

const router = express.Router();

// Routes

router.get("/",InquiryController.getAllInquiries);
router.get("/:inquiryId",InquiryController.getInquiryById);
router.post("/add",InquiryController.addInquiry);

router.use(adminJWT)
router.post("/edit",InquiryController.updateInquiry);
router.delete("/delete/:inquiryId",InquiryController.deleteInquiry);

export default router