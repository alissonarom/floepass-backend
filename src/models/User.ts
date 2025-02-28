import mongoose, { Schema, Document } from "mongoose";

// Interface para o histórico de listas
interface IListHistory {
  listId: mongoose.Types.ObjectId;
  joinedAt: Date;
  leftAt?: Date;
}

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
  profile: "Usuário" | "Promotor" | "Funcionário";
  anniversary: boolean;
  history: IListHistory[];
  penalties: IPenalty[];
  currentLists: mongoose.Types.ObjectId[];
  cash: { type: mongoose.Types.Decimal128, default: 0 },
}

// Schema do usuário
const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  cpf: { type: String, required: true, unique: true },
  birthDate: { type: Date, required: true },
  phone: { type: String, required: true },
  gender: {
    type: String,
    enum: ["Masculino", "Feminino"],
    required: true
  },
  profile: {
    type: String,
    enum: ["Usuário", "Promotor", "Funcionário"],
    required: true,
  },
  anniversary: { type: Boolean, default: false },
  history: [
    {
      listId: { type: Schema.Types.ObjectId, ref: "List", required: true },
      joinedAt: { type: Date, default: Date.now },
      leftAt: { type: Date },
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
  currentLists: [{ type: Schema.Types.ObjectId, ref: "List" }],
  cash: { type: mongoose.Types.Decimal128 },
});

// Exportar o modelo
export default mongoose.model<IUser>("User", UserSchema);