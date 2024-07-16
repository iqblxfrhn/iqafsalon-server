import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import CouponModel from "../models/coupon.model";
import { getAllCouponsService, newCoupon } from "../services/coupon.service";
import { redis } from "../utils/redis";

//create new Coupon
export const createCoupon = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;

      newCoupon(data, res, next);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

//edit product
export const editCoupon = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const couponId = req.params.id;
      const coupon = await CouponModel.findByIdAndUpdate(
        couponId,
        {
          $set: req.body,
        },
        { new: true }
      );

      res.status(201).json({
        success: true,
        coupon,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

//get single coupon _id
export const getSingleCoupon = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const couponId = req.params.id;

      const isChacheExist = await redis.get(couponId);

      if (isChacheExist) {
        const coupon = JSON.parse(isChacheExist);
        return res.status(200).json({
          success: true,
          coupon,
        });
      } else {
        const coupon = await CouponModel.findById(req.params.id);

        await redis.set(couponId, JSON.stringify(coupon), "EX", 604800);

        res.status(200).json({
          success: true,
          coupon,
        });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

//get all coupon
export const getAllCoupons = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllCouponsService(res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

//delete coupon
export const deleteCoupon = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const coupon = await CouponModel.findById(id);

      if (!coupon) {
        return next(new ErrorHandler("Coupon not found", 404));
      }

      await coupon.deleteOne({ id });

      await redis.del(id);

      res.status(200).json({
        success: true,
        message: "Coupon deleted successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
