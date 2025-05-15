// src/backend/models/Lot.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface ILot extends Document {
  title: string;
  sold_out: boolean;
  quantity: number;
  value: number;
  event: Types.ObjectId; // Referência ao evento
  users: Types.ObjectId[]; // Referência aos usuários que compraram o lote
  maleLot: boolean;
  femaleLot: boolean;
}

const LotSchema: Schema = new Schema({
  title: { type: String, required: true },
  sold_out: { type: Boolean, default: false },
  maleLot: { type: Boolean, default: false },
  femaleLot: { type: Boolean, default: false },
  quantity: { type: Number, required: true },
  value: { type: Number, required: true },
  event: { 
    type: Schema.Types.ObjectId, 
    ref: "Event"
  },
  users: [{ 
    type: Schema.Types.ObjectId, 
    ref: "User" 
  }],
});

export default mongoose.model<ILot>("Lot", LotSchema);