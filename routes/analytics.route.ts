import express from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import { getOrdersAnalytics, getProductsAnalytics, getUsersAnalytics } from "../controllers/analytics.controller";
const analyticsRouter = express.Router();

analyticsRouter.get(
  "/get-users-analytics",
  isAuthenticated,
  authorizeRoles("admin"),
  getUsersAnalytics
);
analyticsRouter.get(
  "/get-orders-analytics",
  isAuthenticated,
  authorizeRoles("admin"),
  getOrdersAnalytics
);
analyticsRouter.get(
  "/get-products-analytics",
  isAuthenticated,
  authorizeRoles("admin"),
  getProductsAnalytics
);

export default analyticsRouter;
