import path from "path";
import { ObjectId } from "mongodb";
import Files from "../Model/fileModel.js";
import Dir from "../Model/dirModel.js";
import { purify, updateDirSize } from "./dirController.js";
import mongoose from "mongoose";
import {
  createPutSignUrl,
  deleteMultipleObjects,
  verifyS3Object,
} from "../config/aws_s3.js";
import cloudfrontSignedUrl from "../config/aws_cf.js";

//Get file
export const getFile = async (req, res, next) => {
  const id = req.params?.id;
  try {
    const fileData = await Files.findOne({ _id: new ObjectId(id) }).lean();
    const parentDirData = await Dir.findOne({
      _id: fileData.parentDirId,
      userId: req.user._id,
    }).lean();
    if (!parentDirData) {
      console.log(
        `${req.user.name} is not authorized to access this file: ${id}`,
      );
      return res.status(401).json({ error: "You don't hav access" });
    }
    if (!fileData) {
      console.log(`${id} File is not found`);
      return res.status(404).send("File Not Found");
    }
    const fileFullName = `${id}${fileData.extension}`;
    if (req.query.action === "download") {
      // const getUrl = await createGetSignUrl(fileFullName, true, fileData.name);
      const cfSignedUrl = cloudfrontSignedUrl(
        fileFullName,
        fileData.name,
        true,
      );
      console.log(`${fileData.name} is Downloading by ${req.user.name}`);
      return res.redirect(cfSignedUrl);
    }
    // const getUrl = await createGetSignUrl(fileFullName, false, fileData.name);
    const cfSignedUrl = cloudfrontSignedUrl(fileFullName, fileData.name);
    console.log(`${req.user.name} req for getUrl of file ${fileData.name}`);
    return res.redirect(cfSignedUrl);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// File uplaod Initiated
export const uploadFileInit = async (req, res, next) => {
  const parentDirId =
    req.params.parentDirId || req.user.rootDirId._id.toString();
  const { filename, filesize, filetype } = req.body;

  if (!filesize || +filesize > 100 * 1000 * 1000) {
    console.log(`${req.user.name} trying to upload file bigger that 100mb`);
    return res
      .status(413)
      .json({ error: "File is Too big please upload below 100mb" });
  }
  try {
    const rootDirData = await Dir.findOne({
      userId: req.user._id,
      parentDirId: null,
    })
      .select("size")
      .lean();

    const cleanFileName = purify.sanitize(filename);
    const cleanFileSize = purify.sanitize(filesize);
    const extension = path.extname(cleanFileName);

    if (req.user.capacity - rootDirData.size < +cleanFileSize) {
      console.log(`${req.user.name} file upload .not enough space `);
      return res
        .status(517)
        .json({ error: "You don't have storage enough storage" });
    }

    const parentDirData = await Dir.findOne({
      _id: parentDirId,
    })
      .select("userId path")
      .lean();

    if (!parentDirData.userId.equals(req.user._id)) {
      console.log(
        `${req.user.name} is not authorized to uplaod file initiated`,
      );
      return res
        .status(403)
        .json({ error: "You don't have permission to upload file directly" });
    }

    const fileId = new mongoose.Types.ObjectId();
    const fileFullName = `${fileId.toString()}${extension}`;
    const fileCreated = await Files.insertOne({
      _id: fileId,
      extension,
      name: cleanFileName,
      parentDirId,
      userId: req.user._id,
      size: cleanFileSize,
    });

    const url = await createPutSignUrl(fileFullName, filetype);
    console.log("${req.user.name} IS INITIATED FILE UPLAODING ");
    return res.status(200).json({ url, fileId: fileId.toString() });
  } catch (error) {
    console.log(error);
    if (error.name === "ValidationError") {
      const [errorFor] = Object.keys(error.errors);
      const errorMessage = error.errors[errorFor].properties.message;
      return res.status(401).json({ error: errorMessage });
    }
    next(error);
  }
};

//File upload completed
export const uploadFileComplete = async (req, res, next) => {
  const { filesize } = req.body;
  const fileId = req.params?.fileId;

  const fileData = await Files.findById(fileId).select(
    " extension userId _id parentDirId",
  );
  const parentDirData = await Dir.findById(fileData.parentDirId)
    .select("path -_id")
    .lean();

  if (!fileData.userId.equals(req.user._id)) {
    console.log(`${req.user.name} is not authorized to uplaod file submit`);
    return res
      .status(403)
      .json({ error: "You don't have permission to update file directly" });
  }

  try {
    const fileFullName = `${fileData._id}${fileData.extension}`;
    const objSize = await verifyS3Object(fileFullName);

    if (objSize !== filesize) {
      console.log(`${fileData.name} size not matched with uplaoded file`);
      await fileData.deleteOne();
      res.json({ message: "File Size is match" });
    }
    await fileData.updateOne({ isUploading: false });
    updateDirSize(parentDirData.path, filesize);
    console.log(`${fileData.name} is uploaded successfully`);
    res.json({ message: "File Uploaded Successfully" });
  } catch (error) {
    await fileData.deleteOne();
    console.log(error);
    res.status(400).json({ message: "File Uploaded Failed" });
  }
};

//File Rename
export const renameFile = async (req, res, next) => {
  const id = req.params.id;
  const newFileName = req.body?.newfilename;
  const cleanNewFileName = purify.sanitize(newFileName);
  try {
    const fileData = await Files.findById(id).lean();
    if (!fileData) {
      console.log(`${id} File is not Found in Db`);
      return res.status(405).json({ error: "File not Found" });
    }
    if (!fileData.userId.equals(req.user._id)) {
      console.log(`${req.user.name} is not authorized to access ${id}`);
    }

    if (!cleanNewFileName) {
      console.log(`${req.user.name} provided invalid file name fileId: ${id}`);
      return res.status(401).json({ error: "invalid File name" });
    }

    await Files.updateOne({ _id: id }, { name: cleanNewFileName });
    console.log(`${req.user.name} is renamed the file ${id}`);
    return res.json({ message: "File Renamed Successfully" });
  } catch (error) {
    if (error.name === "ValidationError") {
      const [errorFor] = Object.keys(error.errors);
      const errorMessage = error.errors[errorFor].properties.message;
      return res.status(401).json({ error: errorMessage });
    }
    console.log(error);
    next(error);
  }
};

//File Delete
export const deleteFile = async (req, res, next) => {
  const id = req.params?.id;

  try {
    const fileData = await Files.findById(id)
      .select("parentDirId size extension userId")
      .lean();
    if (!fileData) {
      console.log(`${id} file not found to delete`);
      return res.status(404).json({ error: "Deleting File not Found" });
    }

    if (!fileData.userId.equals(req.user._id)) {
      console.log(`${req.user.name} is trying to delete file ${id}`);
      return res
        .status(403)
        .json({ error: "Not authorized to delete this file " });
    }
    const parentDirData = await Dir.findById(fileData.parentDirId)
      .select("path userId _id")
      .lean();

    const fileFullName = `${id}${fileData.extension}`;
    const { Errors } = await deleteMultipleObjects([fileFullName]);
    if (Errors) {
      console.log(`${id} unable to delte file`);
      return res.status(400).json({ error: "File Could not delete" });
    }
    await Files.findByIdAndDelete(id);
    await updateDirSize(parentDirData.path, -fileData.size);
    console.log(`${id} FILE DELTED SUCCESSFULLY`);
    return res.json({ message: "File Deleted" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
