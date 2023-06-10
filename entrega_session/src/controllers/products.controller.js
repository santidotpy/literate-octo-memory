import { ProductMongo } from "../dao/MongoDB/models/Product.js";
import { faker } from "@faker-js/faker";

const managerProduct = new ProductMongo();

export const getProducts = async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 8;
  const sort = req.query.sort || "asc";
  try {
    // const welcome = [];
    // const name = req.query.name;
    // welcome.push({ text: `Welcome back ${name}` });
    const products = await managerProduct.getElements(page, limit, sort);
    res.status(200).json(products);

   
    // res.render("products/all-products", {
    //   // cambiara con el uso del front
    //   title: "Products",
    //   products: products.docs,
    //   pagination: products.pagination,
    //   currentPage: products.page,
    //   totalPages: products.totalPages,
    //   welcome,
    // });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// obtener productos en formato json
export const getProductsJSON = async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 8;
  const sort = req.query.sort || "asc";
  try {
    const products = await managerProduct.getElements(page, limit, sort);
    res.status(200).json(products);
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

// check stock
export const checkStock = async (id, qty) => {
  try {
    const product = await managerProduct.getElementById(id);
    if (product.stock >= qty) {
      return true;
    }
    return false;
  } catch (error) {
    console.log(error.message);
  }
};

export const getPrice = async (prod_id, qty) => {
  try {
    const product = await managerProduct.getElementById(prod_id);
    const price = product.price * qty;
    return price;
  } catch (error) {
    console.log(error.message);
  }
};

export const buyProducts = async (productsList) => {
  try {
    for (const product of productsList) {
      const productStock = await managerProduct.getElementById(product.id_prod);
      const newStock = productStock.stock - product.quantity;
      await managerProduct.updateElement(product.id_prod, { stock: newStock });
    }
    return true;
  } catch (error) {
    console.log(error.message);
  }
};

export const getProductData = async (productsList) => {
  try {
    const products = [];
    for (const product of productsList) {
      const productInfo = await managerProduct.getElementById(product.id_prod);
      productInfo.quantity = product.quantity;
      products.push(productInfo);
    }
    return products;
  } catch (error) {
    console.log(error.message);
  }
};

// mocking de 50 productos con faker
export const mockingProducts = async (req, res) => {
  const products = [];
  try {
    for (let i = 0; i < 50; i++) {
      const productName = faker.commerce.productName();
      const description = faker.commerce.productDescription();
      const code = faker.number.int();
      const price = parseFloat(faker.commerce.price());
      const thumbnail = faker.image.url();
      const stock = faker.number.int({ min: 0, max: 1000 });
      const status = faker.datatype.boolean();
      const category = faker.commerce.department();

      products.push({
        productName,
        description,
        code,
        price,
        thumbnail,
        stock,
        status,
        category,
      });
    }

    const addProducts = await managerProduct.addElements(products);

    res.status(200).json(addProducts);
  } catch (error) {
    console.log(error.message);
  }
};

// const info = [
//   {
//     id_prod: "64532269974dca345b10207a",
//     quantity: 2,
//     _id: "645af4e1726f135ae40baa3e"
//   },
//   {
//     id_prod: "645886aa8eb90e647e6f20b3",
//     quantity: 1,
//     _id: "645af594726f135ae40baa4a"
//   }
// ]
// const data = await getProductInfo(info)

// console.log(data)
