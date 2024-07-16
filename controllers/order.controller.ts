import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import OrderModel, { IOrder } from "../models/order.model";
import userModel from "../models/user.model";
import ProductModel from "../models/product.model";
import path from "path";
import ejs from "ejs";
import sendMail from "../utils/sendMail";
import NotificationModel from "../models/notification.model";
import { getAllOrdersService, newOrder } from "../services/order.service";

//create order
export const createOrder = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productId, payment_info } = req.body as IOrder;

      const user = await userModel.findById(req.user?._id);

      const product: any = await ProductModel.findById(productId);

      if (!product) {
        return next(new ErrorHandler("Product not found", 404));
      }

      const data: any = {
        productId: product._id,
        userId: user?._id,
        payment_info,
      };

      const mailData = {
        order: {
          _id: product._id.toString().slice(0, 6),
          name: product.name,
          price: product.price,
          date: new Date().toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        },
      };

      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/order-confirmation.ejs"),
        { order: mailData }
      );

      try {
        if (user) {
          await sendMail({
            email: user.email,
            subject: "Order Confirmation",
            template: "order-confirmation.ejs",
            data: mailData,
          });
        }
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
      }

      user?.products.push(product?._id);

      await user?.save();

      await NotificationModel.create({
        user: user?._id,
        title: "New Order",
        message: `Your have new order from ${product?.name}`,
      });

      product.purchased += 1;
      product.stock -= 1;

      await product.save();

      newOrder(data, res, next);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

//get all Order
export const getAllOrders = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllOrdersService(res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

//get all Order of user
export const getAllOrdersUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orders = await OrderModel.find({ userId: req.user?._id }).sort({
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        orders,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

//update order status
export const updateOrderStatus = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await OrderModel.findByIdAndUpdate(req.params.id);

      if (!order) {
        return next(new ErrorHandler("Order not found", 404));
      }

      order.status = req.body.status;
      if (req.body.status === "Delivered") {
        order.deliveredAt = new Date();
      }
      await order.save();

      res.status(200).json({
        success: true,
        order,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
