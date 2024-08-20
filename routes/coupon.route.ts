import express from "express";
import {
  applyCoupon,
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
);
couponRouter.post("/apply-coupon", applyCoupon, isAuthenticated);
couponRouter.put(
  "/edit-coupon/:id",
  editCoupon,
);
couponRouter.get("/get-coupon/:id", getSingleCoupon, isAuthenticated);
couponRouter.get("/get-coupons", getAllCoupons, isAuthenticated);
couponRouter.delete(
  "/delete-coupon/:id",
  deleteCoupon,
  isAuthenticated,
  authorizeRoles("admin")
);

export default couponRouter;
