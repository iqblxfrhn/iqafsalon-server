import express from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import {
  createBooking,
  createMobileBooking,
  getAllBookings,
  getAllBookingsUser,
  updateBookingStatus,
} from "../controllers/booking.controller";
const bookingRouter = express.Router();

bookingRouter.post("/create-booking", isAuthenticated, createBooking);
bookingRouter.post("/create-mobile-booking", isAuthenticated, createMobileBooking);

bookingRouter.get(
  "/get-bookings",
  isAuthenticated,
  authorizeRoles("admin"),
  getAllBookings
);
bookingRouter.get(
  "/get-bookings-user/:id",
  isAuthenticated,
  getAllBookingsUser
);
bookingRouter.put(
  "/update-booking-status/:id",
  isAuthenticated,
  updateBookingStatus
);

export default bookingRouter;
