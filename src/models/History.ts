// src/backend/models/Promoter.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface IHistory extends Document {
  listId: string;
  joinedAt: Date;
  listDate: Date,
  leftAt?: Date;
  name: string;
  users: [{
    id: mongoose.Types.ObjectId,
    firstRound?: boolean;
    secondRound?: boolean;
    ticket: { 
      paying: Boolean,
      reason: string,
      approver?: Types.ObjectId | null
    };
  }];
  isExam?: boolean;
  examScore?: number;
  eventName?: string;
}

const HistorySchema: Schema = new Schema({
    listId: {type: String, required: true},
    joinedAt: { type: Date},
    listDate: { type: Date},
    leftAt: { type: Date },
    name: {type: String, required: true},
    users: {
      type: [{
        id: { type: Schema.Types.ObjectId, ref: "User" },
        firstRound: { type: Boolean, default: false },
        secondRound: { type: Boolean, default: false },
        ticket: {
          paying: { type: Boolean, default: false },
          reason: { type: String },
          approver: { type: Types.ObjectId, default: null}
        }
      }],
      default: [] // Adiciona valor padrão vazio
    },
    isExam: { type: Boolean, default: false },
    examScore: { type: Number, default: 0 },
    eventName: { type: String, required: true }
});

HistorySchema.index({ listDate: -1 });

export default mongoose.model<IHistory>("History", HistorySchema);
