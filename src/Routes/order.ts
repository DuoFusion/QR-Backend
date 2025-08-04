import express from "express";
import { orderController } from "../controllers";

const router = express.Router();

// Routes
router.post("/add", orderController.createOrder);
router.post("/update", orderController.updateOrder);
router.delete("/delete/:orderId", orderController.deleteOrder);

router.get("/", orderController.getAllOrders);
router.get("/:orderId", orderController.getOrderById);

export default router