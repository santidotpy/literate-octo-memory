import { mongoManager } from "../../../db/mongoManager.js";
import { Schema } from "mongoose";
import bcrypt from "bcrypt";

const schema = new Schema({
  name: { type: String, required: true, max: 70 },
  email: { type: String, required: true, max: 254, unique: true },
  password: { type: String, required: true },
  isadmin: { type: Boolean, required: false, max: 10, default: false },
});

export class UserMongo extends mongoManager {
  constructor() {
    super(process.env.mongoUrl, "users", schema);
  }

  // encriptar contraseña todavia no lo uso
  async encryptPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  // comparar contraseña
  async comparePassword(password, receivedPassword) {
    return await bcrypt.compare(password, receivedPassword);
  }

  // obtener usuario por email
  async getUserByEmail(email) {
    super.connect();
    try {
      return await this.model.findOne({ email: email });
    } catch (error) {
      return false;
    }
  }
}
