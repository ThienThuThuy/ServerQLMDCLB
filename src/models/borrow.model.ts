import mongoose, { Document, Schema } from 'mongoose';

export interface IBorrowRequest extends Document {
    user: mongoose.Types.ObjectId;
    equipment: mongoose.Types.ObjectId;
    quantity: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    approvedAt?: Date;
    dueDate: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

const borrowRequestSchema = new Schema<IBorrowRequest>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        equipment: { type: Schema.Types.ObjectId, ref: 'Equipment', required: true },
        quantity: { type: Number, required: true },
        reason: { type: String, required: true },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        approvedAt: {
            type: Date,
        },
        dueDate: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const BorrowRequestModel = mongoose.model<IBorrowRequest>('BorrowRequest', borrowRequestSchema);
export default BorrowRequestModel;