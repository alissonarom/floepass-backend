// src/backend/models/Promoter.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IPromoter extends Document {
  name: string;
  cpf: string;
  birthDate: Date;
  phone: string;
  gender: string;
}

const PromoterSchema: Schema = new Schema({
  name: { type: String, required: true },
  cpf: { type: String, required: true, unique: true },
  birthDate: { type: Date, required: true },
  phone: { type: String, required: true },
  cash: { type: mongoose.Types.Decimal128, default: 0 },
});

export default mongoose.model<IPromoter>("Promoter", PromoterSchema);
