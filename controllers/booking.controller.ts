import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import BookingModel, { IBooking } from "../models/booking.model";
import TreatmentModel from "../models/treatment.model";
import path from "path";
import ejs from "ejs";
import sendMail from "../utils/sendMail";
import NotificationModel from "../models/notification.model";
import { getAllBookingsService, newBooking } from "../services/booking.service";
import userModel from "../models/user.model";

//create booking
export const createBooking = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { treatmentId, bookingDate, bookingTime, payment_info } =
        req.body as IBooking;

      const user = await userModel.findById(req.user?._id);

      const treatment: any = await TreatmentModel.findById(treatmentId);
      if (!treatment) {
        return next(new ErrorHandler("Treatment not found", 404));
      }

      const data: any = {
        treatmentId: treatment._id,
        userId: user?._id,
        bookingDate,
        bookingTime,
        payment_info,
      };

      const mailData = {
        booking: {
          _id: treatment._id.toString().slice(0, 6),
          name: treatment.name,
          price: treatment.price,
          date: new Date().toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        },
      };

      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/booking-confirmation.ejs"),
        { booking: mailData }
      );

      try {
        if (user) {
          await sendMail({
            email: user.email,
            subject: "Booking Confirmation",
            template: "booking-confirmation.ejs",
            data: mailData,
          });
        }
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
      }

      user?.treatments.push(treatment?._id);

      await user?.save();

      await NotificationModel.create({
        user: user?._id,
        title: "New Booking",
        message: `Your have new Booking from ${treatment?.name}`,
      });

      treatment.booked += 1;

      await treatment.save();

      newBooking(data, res, next);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

//get All Booking
export const getAllBookings = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllBookingsService;
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

//get all bookings of user
export const getAllBookingsUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bookings = await BookingModel.find({
        userUd: req.user?._id,
      }).sort({
        createdAt: -1,
      });

      res.status(201).json({
        success: true,
        bookings,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

//update bookings Status
export const updateBookingStatus = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const booking = await BookingModel.findById(req.params.id);

      if (!booking) {
        return next(new ErrorHandler("Booking not found", 404));
      }

      booking.status = req.body.status;

      if (req.body.status === "completed") {
        booking.finishedAt = new Date();
      }
      await booking.save();

      res.status(200).json({
        success: true,
        booking,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
