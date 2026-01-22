import { model, Schema } from "mongoose";

const filesSchema = new Schema(
  {
    name: {
      type: String,
      require: true,
      minLength: 1,
      maxLength: [50, "Directory Name must be less than 50 character"],
    },
    extension: {
      type: String,
      require: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      require: true,
    },
    size: {
      type: BigInt,
      required: true,
      default: 0,
    },
    isUploading: {
      type: Boolean,
      required: true,
      default: true,
    },
    parentDirId: {
      type: Schema.Types.ObjectId,
      require: true,
      ref: "directories",
    },
  },
  {
    timestamps: true,
    strict: "throw",
  }
);

const Files = model("files", filesSchema);

export default Files;
