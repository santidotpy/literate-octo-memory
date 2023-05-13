import { CartMongo } from "../dao/MongoDB/models/Cart.js";
import { TicketMongo } from "../dao/MongoDB/models/Ticket.js";
import { getToken, decodeToken } from "../utils/jwt.js";
import {
  checkStock,
  getPrice,
  buyProducts,
  getProductData,
} from "./products.controller.js";
import { getUserEmail } from "./auth.controller.js";
import { generateReceipt } from "../services/receipt.service.js";
import { sendEmail } from "../services/email.service.js";

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

export const deleteProductFromCart = async (req, res) => {
  try {
    const { id, id_prod } = req.query;

    await managerCart.deleteProductFromCart(id, id_prod);
    const cart = await managerCart.getElementById(id);

    return res.status(200).json(cart);
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
        console.log(stock);
        if (!stock) {
          console.log(`Product ${prod.id_prod} out of stock`);
          await managerCart.deleteProductFromCart(id, prod.id_prod);
          outOfStockProducts.push(prod);
        }
      })
    );

    // en el caso de que tener solo un producto en el carrito
    // y que ese este fuera de stock notifico al usuario
    cart = await managerCart.getElementById(id);
    if (outOfStockProducts.length > 0 && cart.products.length > 0) {
      return res.status(200).json({
        message: "Some products are out of stock",
        outOfStockProducts,
      });
    } else if (cart.products.length == 0) {
      return res.status(200).json({
        message: "Your cart is empty",
      });
    }

    // Calculate total price
    cart = await managerCart.getElementById(id);
    const pricePromises = cart.products.map((prod) =>
      getPrice(prod.id_prod, prod.quantity)
    );
    const prices = await Promise.all(pricePromises);
    const totalAmount = prices.reduce((acc, price) => acc + price, 0);

    // Buy the products
    //console.log(cart.products)
    const successfulPurchase = await buyProducts(cart.products);
    if (successfulPurchase) {
      const productData = await getProductData(cart.products);
      const receipt = generateReceipt(productData, totalAmount, email);
      console.log("Successful purchase");
      //console.log(receipt);
      sendEmail(email, receipt); // notify user
    }

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
      message:
        "Thank you for your purchase. An email has been sent to you with your receipt.",
      productsOutOfStock: cart,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error occurred while processing the request",
    });
  }
};
