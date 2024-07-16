import mongoose, { Document, Model, Schema } from "mongoose";

export interface IBooking extends Document {
  userId: string;
  treatmentId: string;
  bookingDate: Date;
  bookingTime: string; // format HH:mm
  status: string;
  payment_info: object;
  finishedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    userId: {
      type: String,
      required: true,
    },
    treatmentId: {
      type: String,
      required: true,
    },
    bookingDate: {
      type: Date,
      required: true,
    },
    bookingTime: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "Pending",
    },
    payment_info: {
      type: Object,
    },
    finishedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

const BookingModel: Model<IBooking> = mongoose.model("Booking", bookingSchema);
export default BookingModel;
