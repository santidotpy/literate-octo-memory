import { mongoManager } from "../../../db/mongoManager.js";

const schema = {
  productName: { type: String, required: true, max: 100 },
  description: { type: String, required: true, max: 5000 },
  code: { type: Number, required: true, unique: true },
  price: { type: Number, required: true },
  thumbnail: { type: String, max: 500 },
  stock: { type: Number, required: true },
  status: { type: Boolean, required: false, max: 10, default: false },
  category: { type: String, required: true, max: 25 },
};

export class ProductMongo extends mongoManager {
  constructor() {
    super(process.env.mongoUrl, "products", schema);
  }
}
