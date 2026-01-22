import { model, Schema } from "mongoose";

const dirSchema = new Schema(
  {
    name: {
      type: String,
      require: [true, "name Field is required"],
      maxLength: [50, 'Directory Name must be less than 50 character']
    },
    parentDirId: {
      type: Schema.Types.ObjectId || null,
      default: null,
    },
    size: {
      type: BigInt,
      required: true,
      default: 0,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    path:{
      type: [
    {
      type: Schema.Types.ObjectId,
      ref: "directories",
    }
  ],
      default: function(){
        return [this._id]
      }
    }
  },
  {
    timestamps: true,
    strict: "throw",
  }
);

const Dir = model("directories", dirSchema);

export default Dir;
