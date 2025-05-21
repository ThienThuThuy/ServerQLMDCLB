// src/models/user.model.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId; // ✅ _id now has known type
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  password: string;
  contact?: string;
  position: string;
  role: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+\@.+\..+/, 'Please fill a valid email address'],
    },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    contact: { type: String },
    position: { type: String, default: 'Employee', required: true },
    role: { type: String, default: 'user', required: true },
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model<IUser>('User', userSchema);

export default UserModel;
