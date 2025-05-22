import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  password: string;
  contact?: string;
  position: string;
  role: string;
  avatar?: string;
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
    position: { type: String, default: 'Student' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    avatar: { type: String },
  },
  { timestamps: true }
);

const UserModel = mongoose.model<IUser>('User', userSchema);
export default UserModel;
