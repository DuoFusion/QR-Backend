import express from "express";
import { productController } from "../controllers";

const router = express.Router();

// Routes
router.post("/add",productController.addProduct);
router.post("/update", productController.updateProductById);
router.delete("/delete/:productId", productController.deleteProductById);

router.get("/:productId", productController.getProductById);
router.get("/",productController.get_all_users)

export default router