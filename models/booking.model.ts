import mongoose, { Document, Model, Schema } from "mongoose";
import { IUser } from "./user.model";
import { ITreatment } from "./treatment.model";

export interface IBooking extends Document {
  userId: IUser["_id"];
  treatmentId: ITreatment["_id"];
  bookingDate: string;
  bookingTime: string; 
  status: string;
  payment_info: object;
  finishedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    treatmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Treatment",
      required: true,
    },
    bookingDate: {
      type: String,
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
