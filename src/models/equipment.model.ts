// src/models/equipment.model.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IEquipment extends Document {
    name: string;
    full_name: string;
    serial_number: string;
    quantity: number;
    description?: string;

    // Gợi ý thêm:
    status?: 'available' | 'borrowed' | 'maintenance';
    borrowed_by?: mongoose.Types.ObjectId; // userId hoặc memberId
    borrowed_at?: Date;
    return_due_date?: Date;

    createdAt?: Date;
    updatedAt?: Date;
}

const EquipmentSchema = new Schema<IEquipment>(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
        },
        full_name: {
            type: String,
            required: [true, 'Model name is required'],
        },
        serial_number: {
            type: String,
            required: [true, 'Serial number is required'],
            unique: true,
        },
        quantity: {
            type: Number,
            required: [true, 'Quantity is required'],
        },
        description: {
            type: String,
        },

        // Gợi ý thêm cho quản lý mượn thiết bị
        status: {
            type: String,
            enum: ['available', 'borrowed', 'maintenance'],
            default: 'available',
        },
        borrowed_by: {
            type: Schema.Types.ObjectId,
            ref: 'User', // hoặc 'Member', tùy hệ thống bạn
        },
        borrowed_at: {
            type: Date,
        },
        return_due_date: {
            type: Date,
        },
    },
    {
        timestamps: true,
        collection: 'equipment',
    }
);

const EquipmentModel = mongoose.model<IEquipment>('Equipment', EquipmentSchema);

export default EquipmentModel;
