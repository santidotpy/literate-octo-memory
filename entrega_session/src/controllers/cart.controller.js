import { CartMongo } from "../dao/MongoDB/models/Cart.js";
import { TicketMongo } from "../dao/MongoDB/models/Ticket.js";
import { getToken, decodeToken } from "../utils/jwt.js";
import { checkStock, getPrice, buyProducts } from "./products.controller.js";
import { getUserEmail } from "./auth.controller.js";

const managerCart = new CartMongo();
const managerTicket = new TicketMongo();

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
  const { id_prod, quantity } = req.body;

  try {
    const respuesta = await managerCart.addProductCart(
      id_cart,
      id_prod,
      quantity
    );

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

export const getTickets = async (req, res) => {
  try {
    const tickets = await managerTicket.getElements();
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
    console.log(error.message);
  }
};

export const checkout = async (req, res) => {
  try {
    const token = getToken(req);
    const userId = decodeToken(token).payload.user.id;
    const email = await getUserEmail(userId);

    const { id } = req.query;
    let cart = await managerCart.getElementById(id);

    let outOfStockProducts = [];

    // Check if all products are in stock
    await Promise.all(
      cart.products.map(async (prod) => {
        const stock = await checkStock(prod.id_prod, prod.quantity);
        if (!stock) {
          console.log(`Stock insuficiente de ${prod.id_prod}`);
          await managerCart.deleteProductFromCart(id, prod.id_prod);
          outOfStockProducts.push(prod);
        }
      })
    );

    // Calculate total price
    const pricePromises = cart.products.map((prod) =>
      getPrice(prod.id_prod, prod.quantity)
    );
    const prices = await Promise.all(pricePromises);
    const totalAmount = prices.reduce((acc, price) => acc + price, 0);

    // Buy the products
    await buyProducts(cart.products);

    // remove bought products from cart
    await managerCart.deleteProductsCart(id);
    // add products with no stock to cart
    await Promise.all(
      outOfStockProducts.map(async (prod) => {
        await managerCart.addProductCart(id, prod.id_prod, prod.quantity);
      })
    );
    // Add ticket to database
    const date = new Date();
    await managerTicket.addTicket(date, totalAmount, email);
    cart = await managerCart.getElementById(id);

    res.status(200).json({
      message: "Successful purchase",
      productsOutOfStock: cart,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error occurred while processing the request",
    });
  }
};
