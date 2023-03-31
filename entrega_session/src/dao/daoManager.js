export const getManagerProduct = async () => {
  const productModel = await import("./MongoDB/models/Product.js");
  return productModel;
};

export const getManagerMessage = async () => {
  const messageModel = await import("./MongoDB/models/Message.js");
  return messageModel;
};

export const getManagerCart = async () => {
    const cartModel = await import("./MongoDB/models/Cart.js");
    return cartModel;
    }