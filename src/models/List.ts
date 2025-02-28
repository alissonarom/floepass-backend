// src/backend/models/Promoter.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface IList extends Document {
  title: string;
  promotor: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  users: Types.ObjectId[];
}

const ListSchema: Schema = new Schema({
  title: { type: String, required: true },
  promotor: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  users: [{ type: Schema.Types.ObjectId, ref: "User" }],
});

export default mongoose.model<IList>("List", ListSchema);
