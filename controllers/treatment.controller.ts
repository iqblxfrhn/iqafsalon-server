import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import cloudinary from "cloudinary";
import {
  createTreatment,
  getAllTreatmentsService,
} from "../services/treatment.service";
import TreatmentModel from "../models/treatment.model";
import NotificationModel from "../models/notification.model";
import ErrorHandler from "../utils/ErrorHandler";
import { redis } from "../utils/redis";

export const uploadTreatment = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const image = data.image;

      if (image) {
        const myCloud = await cloudinary.v2.uploader.upload(image, {
          folder: "treatments",
        });

        data.image = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      createTreatment(data, res, next);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const editTreatment = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const image = data.image;
      if (image) {
        await cloudinary.v2.uploader.destroy(data?.image?.public_id);
        const myCloud = await cloudinary.v2.uploader.upload(image, {
          folder: "treatments",
        });

        data.image = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      const treatmentId = req.params.id;
      const treatment = await TreatmentModel.findByIdAndUpdate(
        treatmentId,
        {
          $set: data,
        },
        { new: true }
      );

      res.status(201).json({
        success: true,
        treatment,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const getSingleTreatment = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const treatmentId = req.params.id;

      const isChacheExist = await redis.get(treatmentId);

      if (isChacheExist) {
        const treatment = JSON.parse(isChacheExist);
        return res.status(200).json({
          success: true,
          treatment,
        });
      } else {
        const treatment = await TreatmentModel.findById(req.params.id);
        await redis.set(treatmentId, JSON.stringify(treatment), "EX", 604800);

        res.status(200).json({
          success: true,
          treatment,
        });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const getTreatmentByUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userTreatmentList = req.user?.treatments;
      const treatmentId = req.params.id;

      const treatmentExist = userTreatmentList?.find(
        (treatment: any) => treatment._id.toString() === treatmentId
      );

      if (!treatmentExist) {
        return next(
          new ErrorHandler("You are not eligible to access this Treatment", 404)
        );
      }

      const treatment = await TreatmentModel.findById(treatmentId);
      res.status(200).json({
        success: true,
        treatment,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

interface IAddReviewData {
  treatmentId: string;
  review: string;
  rating: number;
  userId: string;
}
export const addReview = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userTreatmentList = req.user?.treatments;
      const treatmentId = req.params.id;

      const treatmentExist = userTreatmentList?.find(
        (treatment: any) => treatment._id.toString() === treatmentId
      );

      if (!treatmentExist) {
        return next(new ErrorHandler("You can't review this treatment", 400));
      }

      const treatment = await TreatmentModel.findById(treatmentId);

      const { review, rating } = req.body as IAddReviewData;

      const reviewData: any = {
        user: req.user,
        comment: review,
        rating,
      };

      treatment?.reviews.push(reviewData);

      let avg = 0;

      treatment?.reviews.forEach((rev: any) => {
        avg += rev.rating;
      });

      if (treatment) {
        treatment.ratings = avg / treatment.reviews.length;
      }

      await treatment?.save();

      await NotificationModel.create({
        user: req.user?._id,
        title: "New Review",
        message: `Your have new review from ${treatment?.name}`,
      });

      res.status(200).json({
        success: true,
        treatment,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

interface IAddReviewData {
  comment: string;
  treatmentId: string;
  reviewId: string;
}

export const addReplyToReview = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { comment, treatmentId, reviewId } = req.body as IAddReviewData;

      const treatment = await TreatmentModel.findById(treatmentId);

      if (!treatment) {
        return next(new ErrorHandler("Treatment not found", 404));
      }

      const review = treatment?.reviews?.find(
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

      await treatment?.save();
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const getAllTreatments = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllTreatmentsService(res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const deleteTreatment = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const treatment = await TreatmentModel.findById(id);

      if (!treatment) {
        return next(new ErrorHandler("Treatment not found", 404));
      }

      await treatment.deleteOne({ id });

      await redis.del(id);

      res.status(200).json({
        success: true,
        message: "Treatment deleted successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
