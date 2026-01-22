import express from "express";
import validateId from "../middleware/validateIdMW.js";
import {
  deleteFile,
  getFile,
  renameFile,
  uploadFileInit,
  uploadFileComplete
} from "../Controller/fileController.js";

const router = express.Router();
router.param("id", validateId);
router.param("parentDirId", validateId);

//Read File
router.get("/:id", getFile);

//Upload File Initate
router.post("/init/{:parentDirId}", uploadFileInit);

//Upload File Complete
router.put("/complete/{:fileId}", uploadFileComplete);

//Rename File
router.patch("/:id", renameFile);

//Delete File
router.delete("/:id", deleteFile);

export default router;
