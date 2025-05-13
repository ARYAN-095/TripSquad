import mongoose, { Document, Schema } from "mongoose";

// 1. Define TypeScript interface for the user
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

// 2. Define the schema
const UserSchema: Schema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt
  }
);

// 3. Export the model
const User = mongoose.model<IUser>("User", UserSchema);
export default User;
