import mongoose, { Document, Model, Schema } from "mongoose";
import { IUser } from "./user.model";

interface IComment extends Document {
  user: IUser;
  comment: string;
  commentReplies: IComment[];
}

interface IReview extends Document {
  user: IUser;
  rating?: number;
  comment: string;
  commentReplies?: IReview[];
}

export interface ITreatment extends Document {
  name: string;
  description: string;
  price: number;
  estimatedPrice?: number;
  duration: number; // in minutes
  image: string;
  reviews: IReview[];
  ratings?: number;
  booked: number;
}

const reviewSchema = new Schema<IReview>(
  {
    rating: {
      type: Number,
      default: 0,
    },
    comment: String,
    user: Object,
    commentReplies: [Object],
  },
  { timestamps: true }
);

const commentSchema = new Schema<IComment>({
  user: Object,
  comment: String,
  commentReplies: [Object],
});

const treatmentSchema = new Schema<ITreatment>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    estimatedPrice: {
      type: Number,
    },
    duration: {
      type: Number,
      required: true,
    },
    image: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },

    reviews: [reviewSchema],
    ratings: {
      type: Number,
      default: 0,
    },
    booked: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const TreatmentModel: Model<ITreatment> = mongoose.model(
  "Treatment",
  treatmentSchema
);
export default TreatmentModel;
