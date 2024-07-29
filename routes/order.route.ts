import express from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import {
  createMobileOrder,
  createOrder,
  getAllOrders,
  getAllOrdersUser,
  newPayment,
  updateOrderStatus,
} from "../controllers/order.controller";

const orderRouter = express.Router();

orderRouter.post("/create-order", isAuthenticated, createOrder);
orderRouter.post("/create-mobile-order", isAuthenticated, createMobileOrder);
orderRouter.post("/payment", isAuthenticated, newPayment);
orderRouter.get(
  "/get-orders",
  isAuthenticated,
  authorizeRoles("admin"),
  getAllOrders
);
orderRouter.get(
  "/get-orders-user/:id",
  isAuthenticated,
  getAllOrdersUser
);
orderRouter.put(
  "/update-order-status/:id",
  isAuthenticated,
  updateOrderStatus
);

export default orderRouter;
