import { Router } from "express";
import { passportError, authorization } from "../utils/messageError.js";
import {
  getProducts,
  addProduct,
  deleteProduct,
  updateProduct,
} from "../controllers/products.controller.js";

const routerProd = Router();

routerProd.get("/products", getProducts);

// agregar productos
routerProd.post("/products", passportError("jwt"), authorization(), addProduct);

// eliminar un producto
routerProd.delete(
  "/products",
  passportError("jwt"),
  authorization(),
  deleteProduct
);

// actualizar un producto
routerProd.put(
  "/products",
  passportError("jwt"),
  authorization(),
  updateProduct
);

export default routerProd;
