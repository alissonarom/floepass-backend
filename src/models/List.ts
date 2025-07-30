// src/backend/models/Promoter.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface IList extends Document {
  title: string;
  owner?: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  isExam?: boolean;
  domain?: string;
  eventName?: string;
  eventId?: Types.ObjectId;
  historico?: Types.ObjectId;
}

const ListSchema: Schema = new Schema({
  title: { type: String, required: true },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  historico: {
    type: Schema.Types.ObjectId,
    ref: "History",
    default: null
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  domain: { type: String },
  isExam: { type: Boolean, default: false },
  eventId: {
    type: Schema.Types.ObjectId,
    ref: "Event",
  },
  eventName: { type: String },
});

ListSchema.index({ createdAt: -1 });

export default mongoose.model<IList>("List", ListSchema);
