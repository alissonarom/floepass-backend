import mongoose, { Schema, Document, Types } from "mongoose";
import History from "./History";


// Interface para as penalidades
interface IPenalty {
  observation: string;
  duration: "15 dias" | "30 dias" | "3 meses" | "6 meses";
  startDate: Date;
}

// Interface do usuário
export interface IUser extends Document {
  name: string;
  cpf: string;
  birthDate: Date;
  phone: string;
  gender: string;
  profile: string;
  anniversary: boolean;
  histories: Types.ObjectId[];
  penalties: IPenalty[];
  currentLists: mongoose.Types.ObjectId;
  cash: number;
  client_id: string;
  password?: string;
  registrationDay: Date;
}

// Schema do usuário
const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  cpf: { type: String, required: true, unique: true },
  birthDate: { type: Date },
  phone: { type: String },
  gender: {
    type: String,
    enum: ["Masculino", "Feminino"],
    required: true
  },
  profile: {
    type: String,
    required: true,
  },
  anniversary: { type: Boolean, default: false },
  histories: [
    {
      type: Schema.Types.ObjectId,
      ref: "History",
    },
  ],
  penalties: [
    {
      observation: { type: String, required: true },
      duration: {
        type: String,
        enum: ["15 dias", "30 dias", "3 meses", "6 meses"],
        required: true,
      },
      startDate: { type: Date, default: Date.now },
    },
  ],
  currentLists: { type: Schema.Types.ObjectId, ref: "List" },
  cash: { type: Number, default: 0 },
  client_id: { type: String, required: true },
  password: { type: String },
  registrationDay: { type: Date, default: Date.now },
});

UserSchema.index({ name: 1 }); // Índice para ordenação/filtro por nome
UserSchema.index({ profile: 1 }); // Índice para filtro por perfil
UserSchema.index({ client_id: 1 }); // Índice para consultas por client_id
UserSchema.index({ 'penalties.startDate': 1 }); // Índice para penalidades

// Exportar o modelo
export default mongoose.model<IUser>("User", UserSchema);