import express from "express";
import { productController } from "../controllers";
import { adminJWT } from "../helper/jwt";

const router = express.Router();

// Routes

router.get("/:productId", productController.getProductById);
router.get("/",productController.get_all_users)

router.use(adminJWT)
router.post("/add",productController.addProduct);
router.post("/edit", productController.updateProductById);
router.delete("/delete/:productId", productController.deleteProductById);

export default router