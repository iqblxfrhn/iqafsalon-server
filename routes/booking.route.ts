import express from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import {
  createBooking,
  getAllBookings,
  getAllBookingsUser,
  updateBookingStatus,
} from "../controllers/booking.controller";
const bookingRouter = express.Router();

bookingRouter.post("/create-booking", isAuthenticated, createBooking);
bookingRouter.get(
  "/get-bookings",
  isAuthenticated,
  authorizeRoles("admin"),
  getAllBookings
);
bookingRouter.get(
  "/get-bookings-user/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  getAllBookingsUser
);
bookingRouter.put(
  "/update-booking-status/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  updateBookingStatus
);

export default bookingRouter;
