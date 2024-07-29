import mongoose, { Document, Model, Schema } from "mongoose";
import { IProduct } from "./product.model";
import { IUser } from "./user.model";

export interface IOrder extends Document {
  productId: IProduct["_id"];
  userId: IUser["_id"];
  payment_info: object;
  quantity: number;
  status: string;
  deliveredAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    payment_info: {
      type: Object,
    },
    quantity: {
      type: Number,
    },
    status: {
      type: String,
      default: "Processing",
    },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

const OrderModel: Model<IOrder> = mongoose.model("Order", orderSchema);

export default OrderModel;
