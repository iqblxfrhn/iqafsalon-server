import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from "cloudinary";
import {
  createProduct,
  getAllProductsService,
} from "../services/product.service";
import ProductModel from "../models/product.model";
import { redis } from "../utils/redis";
import NotificationModel from "../models/notification.model";

export const uploadProduct = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const image = data.image;
      if (image) {
        const myCloud = await cloudinary.v2.uploader.upload(image, {
          folder: "products",
        });

        data.image = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }
      createProduct(data, res, next);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const editProduct = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const image = data.image;

      if (image) {
        await cloudinary.v2.uploader.destroy(data?.image?.public_id);
        const myCloud = await cloudinary.v2.uploader.upload(image, {
          folder: "products",
        });

        data.image = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      const productId = req.params.id;

      const product = await ProductModel.findByIdAndUpdate(
        productId,
        {
          $set: data,
        },
        { new: true }
      );

      res.status(201).json({
        success: true,
        product,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const getSingleProduct = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productId = req.params.id;

      const isCacheExist = await redis.get(productId);

      if (isCacheExist) {
        const product = JSON.parse(isCacheExist);
        return res.status(200).json({
          success: true,
          product,
        });
      } else {
        const product = await ProductModel.findById(req.params.id);

        await redis.set(productId, JSON.stringify(product), "EX", 604800);
        res.status(200).json({
          success: true,
          product,
        });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
export const getProductByUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userProductList = req.user?.products;
      const productId = req.params.id;

      const productExist = userProductList?.find(
        (product: any) => product._id.toString() === productId
      );

      if (!productExist) {
        return next(
          new ErrorHandler("You are not eligible to access this Product", 404)
        );
      }

      const product = await ProductModel.findById(productId);

      res.status(200).json({
        success: true,
        product,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);


interface IAddReviewData {
  productId: string;
  review: string;
  rating: number;
  userId: string;
}

export const addReview = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userProductList = req.user?.products;

      const productId = req.params.id;

      const productExist = userProductList?.some(
        (product: any) => product._id.toString() === productId.toString()
      );

      if (!productExist) {
        return next(new ErrorHandler("You can't review this product", 400));
      }

      const product = await ProductModel.findById(productId);

      const { review, rating } = req.body as IAddReviewData;

      const reviewData: any = {
        user: req.user,
        comment: review,
        rating,
      };

      product?.reviews.push(reviewData);

      let avg = 0;

      product?.reviews.forEach((rev: any) => {
        avg += rev.rating;
      });

      if (product) {
        product.ratings = avg / product.reviews.length;
      }

      await product?.save();

      await NotificationModel.create({
        user: req.user?._id,
        title: "New Review Received",
        message: `Your have new Review from ${product?.name}`,
      });

      res.status(200).json({
        success: true,
        product,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

interface IAddReviewData {
  comment: string;
  productId: string;
  reviewId: string;
}

export const addReplyToReview = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { comment, productId, reviewId } = req.body as IAddReviewData;

      const product = await ProductModel.findById(productId);

      if (!product) {
        return next(new ErrorHandler("Product not found", 404));
      }

      const review = product?.reviews?.find(
        (rev: any) => rev._id.toString() === reviewId
      );

      if (!review) {
        return next(new ErrorHandler("Review not found", 404));
      }

      const replyData: any = {
        user: req.user,
        comment,
      };

      if (!review.commentReplies) {
        review.commentReplies = [];
      }
      review.commentReplies?.push(replyData);

      await product?.save();

      res.status(200).json({
        success: true,
        product,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const getAllProducts = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllProductsService(res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const deleteProduct = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const product = await ProductModel.findById(id);

      if (!product) {
        return next(new ErrorHandler("Product not found", 404));
      }

      await product.deleteOne({ id });

      await redis.del(id);

      res.status(200).json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
