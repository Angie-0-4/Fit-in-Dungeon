import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,         
      unique: true,
      index: true,
    },
    password: {
      type: String,
      required: true,         
    },
    gender: {
      type: String,
      enum: ["sir", "lady"],
      default: null,           
    },
  },
  { timestamps: true }
);


userSchema.index({ username: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);
export default User;