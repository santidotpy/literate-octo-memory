import { ProductMongo } from "../dao/MongoDB/models/Product.js";

const managerProduct = new ProductMongo();

export const getProducts = async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 8;
  const sort = req.query.sort || "asc";
  try {
    const welcome = [];
    const name = req.query.name;
    welcome.push({ text: `Welcome back ${name}` });
    const products = await managerProduct.getElements(page, limit, sort);
    //res.status(200).json(products);
    res.render("products/all-products", {
      // cambiara con el uso del front
      title: "Products",
      products: products.docs,
      pagination: products.pagination,
      currentPage: products.page,
      totalPages: products.totalPages,
      welcome,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// add product
export const addProduct = async (req, res) => {
  const {
    productName,
    description,
    code,
    price,
    thumbnail,
    stock,
    status,
    category,
  } = req.body;
  try {
    const newProduct = await managerProduct.addElements({
      productName,
      description,
      code,
      price,
      thumbnail,
      stock,
      status,
      category,
    });
    res.status(200).json(newProduct);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// eliminar un producto
export const deleteProduct = async (req, res) => {
  const { id } = req.query;
  try {
    await managerProduct.deleteElement(id);
    res.status(200).json({
      message: `Product ${id} deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// actualizar un producto
export const updateProduct = async (req, res) => {
  const { id } = req.query;
  const {
    productName,
    description,
    code,
    price,
    thumbnail,
    stock,
    status,
    category,
  } = req.body;
  try {
    await managerProduct.updateElement(id, {
      productName,
      description,
      code,
      price,
      thumbnail,
      stock,
      status,
      category,
    });
    const product = await managerProduct.getElementById(id); // mando el producto actualizado
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
