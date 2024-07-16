import express from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import {
  createOrder,
  getAllOrders,
  getAllOrdersUser,
  updateOrderStatus,
} from "../controllers/order.controller";

const orderRouter = express.Router();

orderRouter.post("/create-order", isAuthenticated, createOrder);
orderRouter.get(
  "/get-orders",
  isAuthenticated,
  authorizeRoles("admin"),
  getAllOrders
);
orderRouter.get(
  "/get-orders-user/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  getAllOrdersUser
);
orderRouter.put(
  "/update-order-status/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  updateOrderStatus
);

export default orderRouter;
