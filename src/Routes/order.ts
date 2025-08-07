import express from "express";
import { orderController } from "../controllers";
import { adminJWT } from "../helper/jwt";

const router = express.Router();

// Routes

router.get("/", orderController.getAllOrders);
router.get("/:orderId", orderController.getOrderById);

router.use(adminJWT)
router.post("/add", orderController.addOrder);
router.post("/edit", orderController.updateOrder);
router.delete("/delete/:orderId", orderController.deleteOrder);

export default router