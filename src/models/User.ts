import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  cpf: string;
  birthDate: Date;
  phone: string;
  gender: string;
  profile: "common" | "promoter" | "employee";
  anniversary: boolean;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  cpf: { type: String, required: true, unique: true },
  birthDate: { type: Date, required: true },
  phone: { type: String, required: true },
  gender: { type: String, required: true },
  profile: {
    type: String,
    enum: ["common", "promoter", "employee"],
    required: true,
  },
});

export default mongoose.model<IUser>("User", UserSchema);
