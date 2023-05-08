import { mongoManager } from "../../../db/mongoManager.js";
import { Schema } from "mongoose";

const schema = {
  products: [
    {
      id_prod: {
        type: Schema.Types.ObjectId,
        ref: "products",
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
};

export class CartMongo extends mongoManager {
  constructor() {
    super(process.env.mongoUrl, "carts", schema);
  }
  async addProductCart(id, idProd, qty) {
    super.connect();
    const carrito = await this.model.findById(id);
    carrito.products.push({ id_prod: idProd, quantity: qty });
    return carrito.save();
  }

  async getProductsCart() {
    super.connect();
    const prods = await this.model.find().populate("products.id_prod");
    return prods;
  }

  async deleteProductCart(id) {
    super.connect();
    const carrito = await this.model.findById(id);
    carrito.products.filter((prod) => prod._id != id);
    carrito.save();
    return true;
  }

  async deleteProductFromCart(id, idProd) {
    const updatedCart = await this.model.findOneAndUpdate(
      { _id: id },
      { $pull: { products: { id_prod: idProd } } },
      { new: true }
    );

    return !!updatedCart;
  }

  async deleteProductsCart(id) {
    super.connect();
    const carrito = await this.model.findById(id);
    carrito.products = [];
    carrito.save();
    return true;
  }

  async updateProductCart(id, ...data) {
    super.connect();
    console.log(data);
    const carrito = await this.model.findById(id);
    console.log(carrito);
    const aux = { ...data };
    carrito.products.findIndex((prod) => prod._id == id);
    carrito[index] = aux;
    carrito.save();
    return true;
  }

  async updateProductsCart(id, products) {
    super.connect();
    const carrito = await this.model.findById(id);
    carrito.products = products;
    carrito.save();
    return true;
  }
}
