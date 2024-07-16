import express from "express";
import {
  addReplyToReview,
  addReview,
  deleteTreatment,
  editTreatment,
  getAllTreatments,
  getSingleTreatment,
  getTreatmentByUser,
  uploadTreatment,
} from "../controllers/treatment.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
const treatmentRouter = express.Router();

treatmentRouter.post(
  "/create-treatment",
  isAuthenticated,
  authorizeRoles("admin"),
  uploadTreatment
);
treatmentRouter.put(
  "/edit-treatment/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  editTreatment
);
treatmentRouter.get("/get-treatment/:id", getSingleTreatment);
treatmentRouter.get("/get-treatments", getAllTreatments);
treatmentRouter.get(
  "/get-treatment-content/:id",
  getTreatmentByUser,
  isAuthenticated
);
treatmentRouter.put("/add-review/:id", addReview, isAuthenticated);
treatmentRouter.put(
  "/add-reply/:id",
  addReplyToReview,
  isAuthenticated,
  authorizeRoles("admin")
);
treatmentRouter.delete(
  "/delete-treatment/:id",
  deleteTreatment,
  isAuthenticated,
  authorizeRoles("admin")
);

export default treatmentRouter;
