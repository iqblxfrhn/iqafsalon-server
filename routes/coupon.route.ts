import express from "express";
import {
  createCoupon,
  deleteCoupon,
  editCoupon,
  getAllCoupons,
  getSingleCoupon,
} from "../controllers/coupon.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
const couponRouter = express.Router();

couponRouter.post(
  "/create-coupon",
  createCoupon,
  isAuthenticated,
  authorizeRoles("admin")
);
couponRouter.put(
  "/edit-coupon/:id",
  editCoupon,
  isAuthenticated,
  authorizeRoles("admin")
);
couponRouter.get("/get-coupon/:id", getSingleCoupon, isAuthenticated);
couponRouter.get(
  "/get-coupons",
  getAllCoupons,
  isAuthenticated,
  authorizeRoles("admin")
);
couponRouter.delete(
  "/delete-coupon/:id",
  deleteCoupon,
  isAuthenticated,
  authorizeRoles("admin")
);


export default couponRouter;
