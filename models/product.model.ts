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

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  estimatedPrice?: number;
  tags: string;
  image: string;
  stock: number;
  reviews: IReview[];
  ratings?: number;
  purchased: number;
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

const productSchema = new Schema<IProduct>(
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
    image: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    tags: {
      type: String,
      require: true,
    },
    stock: {
      type: Number,
      required: true,
    },
    reviews: [reviewSchema],
    ratings: {
      type: Number,
      default: 0,
    },
    purchased: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const ProductModel: Model<IProduct> = mongoose.model("Product", productSchema);
export default ProductModel;
