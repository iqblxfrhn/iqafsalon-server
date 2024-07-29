import { NextFunction, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import BookingModel from "../models/booking.model";

export const newBooking =async (data: any, midtransResponse: any) => {
  const booking = new BookingModel({
    treatmentId: data.treatmentId,
    userId: data.userId,
    payment_info: data.payment_info,
    midtransResponse, 
    bookingDate: data.bookingDate,
    bookingTime: data.bookingTime
  });

  await booking.save();
};

export const getAllBookingsService = async (res: Response) => {
  const bookings = await BookingModel.find().sort({ createdAt: -1 });

  res.status(201).json({
    success: true,
    bookings,
  });
};
