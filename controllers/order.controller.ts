import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import OrderModel, { IOrder } from "../models/order.model";
import userModel from "../models/user.model";
import ProductModel, { IProduct } from "../models/product.model";
import path from "path";
import ejs from "ejs";
import sendMail from "../utils/sendMail";
import NotificationModel from "../models/notification.model";
import { getAllOrdersService, newOrder } from "../services/order.service";
import { redis } from "../utils/redis";
import { MidtransClient } from "midtrans-node-client";
require("dotenv").config();

const midtrans = new MidtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

export const createOrder = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productId, payment_info, quantity } = req.body as IOrder;

      const user = await userModel.findById(req.user?._id);
      const product: any = await ProductModel.findById(productId);

      if (!product) {
        return next(new ErrorHandler("Product not found", 404));
      }

      if (product.stock < quantity) {
        return next(new ErrorHandler("Stock Produk Habis", 404));
      }

      const data: any = {
        productId: product._id,
        userId: user?._id,
        payment_info,
        quantity,
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
      await redis.set(req.user?._id as string, JSON.stringify(user));
      await user?.save();

      await NotificationModel.create({
        user: user?._id,
        title: "New Order",
        message: `You have a new order from ${product?.name} with quantity ${quantity}`,
      });

      product.purchased += quantity;
      product.stock -= quantity;
      await product.save();

      const midtransTransaction = {
        transaction_details: {
          order_id: `order-${Date.now()}`,
          gross_amount: product.price,
        },
        credit_card: {
          secure: true,
        },
      };

      const midtransResponse = await midtrans.createTransaction(
        midtransTransaction
      );

      await newOrder(data, midtransResponse);

      res.json({ midtransResponse });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const createMobileOrder = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productId, payment_info, quantity } = req.body as IOrder;
      const user = await userModel.findById(req.user?._id);
      const product: any = await ProductModel.findById(productId);

      if (!product) {
        return next(new ErrorHandler("Product not found", 404));
      }

      if (product.stock < quantity) {
        return next(new ErrorHandler("Stock Produk Habis", 404));
      }

      const data: any = {
        productId: product._id,
        userId: user?._id,
        payment_info,
        quantity,
      };

      const mailData = {
        order: {
          _id: product._id.toString().slice(0, 6),
          name: product.name,
          price: product.price,
          quantity,
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
      await redis.set(req.user?._id as string, JSON.stringify(user));
      await user?.save();

      await NotificationModel.create({
        user: user?._id,
        title: "New Order",
        message: `You have a new order from ${product?.name} with quantity ${quantity}`,
      });

      product.purchased += quantity;
      product.stock -= quantity;
      await product.save();

      const midtransTransaction = {
        transaction_details: {
          order_id: `order-${Date.now()}`,
          gross_amount: product.price,
        },
        credit_card: {
          secure: true,
        },
      };

      const midtransResponse = await midtrans.createTransaction(
        midtransTransaction
      );

      await newOrder(data, midtransResponse);

      res.json({ midtransResponse });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const getAllOrders = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllOrdersService(res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const getAllOrdersUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orders = await OrderModel.find({ userId: req.user?._id })
        .sort({
          createdAt: -1,
        })
        .populate("productId")
        .populate("userId");
      res.status(201).json({
        success: true,
        orders,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const updateOrderStatus = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await OrderModel.findById(req.params.id);

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

export const newPayment = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { amount, orderId } = req.body;

      const midtransTransaction = {
        transaction_details: {
          order_id: orderId,
          gross_amount: amount,
        },
        credit_card: {
          secure: true,
        },
      };

      const midtransResponse = await midtrans.createTransaction(
        midtransTransaction
      );

      res.status(201).json({
        success: true,
        redirect_url: midtransResponse.redirect_url,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
