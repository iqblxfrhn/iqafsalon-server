import express from "express";
import {
  addReplyToReview,
  addReview,
  deleteProduct,
  editProduct,
  getAllProducts,
  getProductByUser,
  getSingleProduct,
  uploadProduct,
} from "../controllers/product.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
const productRouter = express.Router();

productRouter.post(
  "/create-product",
  isAuthenticated,
  authorizeRoles("admin"),
  uploadProduct
);
productRouter.put(
  "/edit-product/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  editProduct
);
productRouter.get("/get-product/:id", isAuthenticated, getSingleProduct);
productRouter.get(
  "/get-products",
  getAllProducts,
);
productRouter.get(
  "/get-product-content/:id",
  isAuthenticated,
  getProductByUser
);
productRouter.put("/add-review/:id", isAuthenticated, addReview);
productRouter.put(
  "/add-reply",
  isAuthenticated,
  authorizeRoles("admin"),
  addReplyToReview
);
productRouter.delete(
  "/delete-product/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  deleteProduct
);

export default productRouter;
