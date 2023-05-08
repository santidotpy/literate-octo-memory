import { mongoManager } from "../../../db/mongoManager.js";
import { Schema, Types } from "mongoose";

const schema = {
  code: {
    type: Schema.Types.ObjectId,
    default: () => new Types.ObjectId(),
    unique: true,
  },
  purchase_datetime: { type: Date, required: true },
  amount: { type: Number, required: true },
  purchaser: { type: String, required: true },
};

export class TicketMongo extends mongoManager {
  constructor() {
    super(process.env.mongoUrl, "tickets", schema);
  }

  async addTicket(purchase_datetime, amount, purchaser) {
    super.connect();
    const ticket = new this.model({
      purchase_datetime,
      amount,
      purchaser,
    });
    return await ticket.save();
  }
}
