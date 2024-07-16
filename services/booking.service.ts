import { NextFunction, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import BookingModel from "../models/booking.model";

//create new booking
export const newBooking = CatchAsyncError(async (data: any, res: Response) => {
  const booking = await BookingModel.create(data);

  res.status(201).json({
    success: true,
    booking,
  });
});

//get all bookings
export const getAllBookingsService = async (res: Response) => {
  const bookings = await BookingModel.find().sort({ createdAt: -1 });

  res.status(201).json({
    success: true,
    bookings,
  });
};
