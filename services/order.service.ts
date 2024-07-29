import { NextFunction, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import OrderModel from "../models/order.model";

export const newOrder = async (data: any, midtransResponse: any) => {
  const order = new OrderModel({
    productId: data.productId,
    userId: data.userId,
    payment_info: data.payment_info,
    midtransResponse,
    quantity: data.quantity,
  });

  await order.save();
};

export const getAllOrdersService = async (res: Response) => {
  const orders = await OrderModel.find().sort({ createdAt: -1 });

  res.status(201).json({
    success: true,
    orders,
  });
};
