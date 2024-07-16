import { NextFunction, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import CouponModel from "../models/coupon.model";

//create new Coupon
export const newCoupon = CatchAsyncError(async (data: any, res: Response) => {
  const coupon = await CouponModel.create(data);

  res.status(201).json({
    success: true,
    coupon,
  });
});

//get all Coupons
export const getAllCouponsService = async (res: Response) => {
  const coupons = await CouponModel.find().sort({ createdAt: -1 });

  res.status(201).json({
    success: true,
    coupons,
  });
};