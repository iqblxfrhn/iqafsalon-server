import mongoose, { Document, Model, Schema } from "mongoose";

export interface IOrder extends Document {
  productId: string;
  userId: string;
  payment_info: object;
  status: string;
  deliveredAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    productId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    payment_info: {
      type: Object,
      // required: true,
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
