import mongoose, { model } from "mongoose";
import { Schema } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    name: {
      type: String,
      require: true,
      minLength: [2, "name must atleast 2 character"],
      lowercase: true,
      trim: true,
      maxLength: [50, "Directory Name must be less than 50 character"],
    },
    email: {
      type: String,
      require: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please, enter valid email",
      ],
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      minLength: [8, "Password must be  8-16 character"],
      maxLength:[16, "Password must be  8-16 character"]
    },
    picture: {
      type: String,
      default:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYzrKwzB9qf6z1LUGt9CMjPzC5zBy87WL6Fw&s",
    },
    role: {
      type: String,
      enum: ["Admin", "Manager", "User"],
      default: "User",
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    capacity: {
      type: BigInt,
      default: 1024 * 1024 * 50,
      required: true,
    },
    rootDirId: {
      type: Schema.Types.ObjectId,
      require: true,
      ref: "directories",
    },
  },
  {
    strict: "throw",
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return;
  else this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (enterPassword) {
  return bcrypt.compare(enterPassword, this.password);
};

const Users = mongoose.models.User || mongoose.model("User", userSchema);

export default Users;
