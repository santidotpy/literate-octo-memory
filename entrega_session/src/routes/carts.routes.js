import { Router } from "express";
import {
  authorizationUser,
  authorization,
  passportError,
} from "../utils/messageError.js";
import {
  createCart,
  getCarts,
  getCartContent,
  addProductToCart,
  emptyCart,
  updateProductCart,
  deleteProductCart,
  deleteProductFromCart,
  checkout,
} from "../controllers/cart.controller.js";

const routerCart = Router();

// POST para crear un carrito pero medio como que ya no hace falta
routerCart.post("/cart", createCart);

// GET de todos los productos de un carrito en particular
routerCart.get("/carts/", passportError("jwt"), authorization(), getCarts);

// GET de todos los productos de un carrito en particular
routerCart.get(
  "/cart/",
  passportError("jwt"),
  authorizationUser(),
  getCartContent
);

// POST para agregar productos al carrito - deprecado
routerCart.post(
  "/add-to-cart",
  passportError("jwt"),
  authorizationUser(),
  addProductToCart
);

// // DELETE para eliminar todos los productos del carrito
routerCart.delete(
  "/cart",
  passportError("jwt"),
  authorizationUser(),
  emptyCart
);

// // PUT para actualizar productos del carrito
routerCart.put(
  "/cart/:cid/product",
  passportError("jwt"),
  authorizationUser(),
  updateProductCart
);

// // DELETE para eliminar productos del carrito
routerCart.delete(
  "/carts/product/:pid",
  passportError("jwt"),
  authorizationUser(),
  deleteProductCart
);

// DELETE para eliminar productos del carrito - cool
routerCart.delete(
  "/cart/product",
  passportError("jwt"),
  authorizationUser(),
  deleteProductFromCart
);

// purchase
routerCart.post(
  "/checkout",
  passportError("jwt"),
  authorizationUser(),
  checkout
);

export default routerCart;
