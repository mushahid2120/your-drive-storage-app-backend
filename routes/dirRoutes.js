import express from "express";
import validateId from "../middleware/validateIdMW.js";
import {
  createDir,
  deleteDir,
  getAllDir,
  renameDir,
} from "../Controller/dirController.js";

const router = express.Router();
router.param("id", validateId);
router.param("parentDirId", validateId);
router.param("folderId", validateId);

//Read Direactory
router.get("/{:id}", getAllDir);

//Create Directory
router.post("/{:parentDirId}", createDir);

//Rename Directory
router.patch("/:folderId", renameDir);

//Delete Directory
router.delete("/:folderId", deleteDir);

export default router;
