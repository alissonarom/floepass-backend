// src/backend/models/Promoter.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface IEvent extends Document {
  title: string;
  owner: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  lists: Types.ObjectId[];
  domain?: string;
  basePrice: number;
  femaleBasePrice: number;
  maleBasePrice: number;
}

const EventSchema: Schema = new Schema({
  title: { type: String, required: true },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  lists: [{ type: Schema.Types.ObjectId, ref: "List" }],
  domain: { type: String },
  basePrice: { type: Number, default: 0 },
  femaleBasePrice: { type: Number, default: 0 },
  maleBasePrice: { type: Number, default: 0 },
}, {
  timestamps: true // Adiciona createdAt e updatedAt automaticamente
});

export default mongoose.model<IEvent>("Event", EventSchema);
