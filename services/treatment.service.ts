import { Response } from "express";
import TreatmentModel from "../models/treatment.model";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";

export const createTreatment = CatchAsyncError(
  async (data: any, res: Response) => {
    const treatment = await TreatmentModel.create(data);

    return res.status(201).json({
      success: true,
      treatment,
    });
  }
);

export const getAllTreatmentsService = async (res: Response) => {
  const treatments = await TreatmentModel.find().sort({ createdAt: -1 });

  res.status(201).json({
    success: true,
    treatments,
  });
};
