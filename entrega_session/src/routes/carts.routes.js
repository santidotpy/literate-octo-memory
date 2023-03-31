import { Router } from "express";
import { CartMongo } from "../dao/MongoDB/models/Cart.js";

const managerCart = new CartMongo();

const routerCart = Router();

// POST para crear un carrito
routerCart.post("/cart", async (req, res) => {
  try {
    const respuesta = await managerCart.addElements();

    return res.status(200).json(respuesta);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// GET de todos los productos de un carrito en particular
routerCart.get("/cart/:id", async (req, res) => {
  try {
    const productos = await managerCart.getProductsCart();

    if (productos) {
      return res.status(200).json(productos);
    }

    res.status(200).json({
      message: "Productos no encontrados",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// POST para agregar productos al carrito
routerCart.post("/cart/:id", async (req, res) => {
  const { id } = req.params;
  const { id_prod, cant } = req.body;

  try {
    const product = await managerCart.addProductCart(id, id_prod, cant);
    res.status(204).json(product);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// DELETE para eliminar todos los productos del carrito
routerCart.delete("/cart/:cid", async (req, res) => {
  const cartId = req.params.cid;
  const deletedCart = await managerCart.deleteProductsCart(cartId);
  console.log(`${cartId} deleted`);
  res.render("cart/cart", {
    title: "Carts",
    carts: JSON.stringify(deletedCart),
  });
});

// PUT para actualizar productos del carrito
routerCart.put("/cart/:cid", async (req, res) => {
  const cartId = req.params.cid;
  const cart = req.body;
  const updatedCart = await managerCart.updateElement(cartId, cart);
  console.log(updatedCart);
  res.render("cart/cart", {
    title: "Carts",
    carts: JSON.stringify(updatedCart),
  });
});

// PUT para actualizar productos del carrito
routerCart.put("/cart/:cid/product", async (req, res) => {
  const { cid } = req.params;
  const { id_prod } = req.body;
  const { quantity } = req.body;
  try {
    const product = await managerCart.updateProductCart(cid, {
      id_prod,
      quantity,
    });

    if (product) {
      return res.status(200).json({
        message: "Producto actualizado",
      });
    }

    res.status(200).json({
      message: "Producto no encontrado",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// DELETE para eliminar productos del carrito
routerCart.delete("/carts/product/:pid", async (req, res) => {
    const { pid } = req.params;
  try {
    const product = await managerCart.deleteProductCart(pid);
    console.log(product);

    if (product) {
      return res.status(200).json({
        message: "Producto eliminado",
      });
    }

    res.status(200).json({
      message: "Producto no encontrado",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

export default routerCart;
