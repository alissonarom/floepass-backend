import express from "express";
import upload from "../middleware/photoUpload";
import { checkPhotoPermission } from "../middleware/photoPermissions";
import { authenticate } from "../utils/index";
import {
  uploadPhoto,
  deletePhoto,
  getUserPhoto,
} from "../controllers/PhotoController";

const router = express.Router();

router.use(authenticate);

router.post(
  "/upload",
  checkPhotoPermission,
  upload.single("photo"),
  uploadPhoto
);

router.delete("/:userId", checkPhotoPermission, deletePhoto);

router.get("/:userId", getUserPhoto);

export default router;
