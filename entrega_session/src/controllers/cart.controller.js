import { CartMongo } from "../dao/MongoDB/models/Cart.js";

const managerCart = new CartMongo();

export const createCart = async (req, res) => {
  try {
    const respuesta = await managerCart.addElements();

    return respuesta; // retorna un array con el carrito creado
  } catch (error) {
    // res.status(500).json({
    //   message: error.message,
    // });
    console.log(error.message);
    return error;
  }
};

export const getCarts = async (req, res) => {
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
};

export const getCartContent = async (req, res) => {
  const { id } = req.query;

  try {
    const respuesta = await managerCart.getElementById(id);

    return res.status(200).json(respuesta);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const addProductToCart = async (req, res) => {
  const { id_cart } = req.query;
  const { id_prod, cant } = req.body;

  try {
    const respuesta = await managerCart.addProduct(id_cart, id_prod, cant);

    return res.status(200).json(respuesta);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const emptyCart = async (req, res) => {
  const { cartId } = req.query;
  console.log(cartId);
  try {
    const deletedCart = await managerCart.deleteProductsCart(cartId);
    if (deletedCart) {
      console.log(`Cart ${cartId} emptied`);
      return res.status(200).json({
        message: "Cart emptied",
      });
    }
    res.status(200).json({
      message: "Cart not found",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// actualizar productos del carrito
export const updateProductCart = async (req, res) => {
  const { id } = req.query;
  const { id_prod, cant } = req.body;

  try {
    const respuesta = await managerCart.updateProduct(id, id_prod, cant);

    return res.status(200).json(respuesta);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteProductCart = async (req, res) => {
  const { pid } = req.query;

  try {
    const product = await managerCart.deleteProductCart(pid);

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
};
