// src/models/reminder.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IReminder extends Document {
    user: mongoose.Types.ObjectId;
    message: string;
    seen: boolean;
    createdAt?: Date;
}

const reminderSchema = new Schema<IReminder>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        message: { type: String, required: true },
        seen: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.model<IReminder>('Reminder', reminderSchema);
