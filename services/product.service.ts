import { Response } from "express";
import ProductModel from "../models/product.model";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";

export const createProduct = CatchAsyncError(
  async (data: any, res: Response) => {
    const product = await ProductModel.create(data);

    return res.status(201).json({
      success: true,
      product,
    });
  }
);

export const getAllProductsService = async (res: Response) => {
  const products = await ProductModel.find().sort({ createdAt: -1 });

  res.status(201).json({
    success: true,
    products,
  });
};



