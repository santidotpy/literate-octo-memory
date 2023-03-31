import { mongoManager } from "../../../db/mongoManager.js";
import { Schema } from "mongoose";

const schema = new Schema({
  username: { type: String, required: true, max: 70 },
  email: { type: String, required: true, max: 254, unique: true },
  message: { type: String, required: true, max: 280 },
});

export class MessageMongo extends mongoManager {
  constructor() {
    super(process.env.MONGOURL, "messages", schema);
  }
}
