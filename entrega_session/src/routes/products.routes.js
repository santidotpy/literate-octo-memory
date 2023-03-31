import { Router } from "express";
import { ProductMongo } from "../dao/MongoDB/models/Product.js";

const managerProduct = new ProductMongo();

const routerProd = Router();

routerProd.get("/products", async (req, res) => {
  const welcome = [];
  const name = req.query.name;
  welcome.push({ text: `Welcome back ${name}` });

  const page = req.query.page || 1;
  const limit = req.query.limit || 8;
  const sort = req.query.sort || "asc";
  const products = await managerProduct.getElements(page, limit, sort);
  //console.log(products);
  res.render("products/all-products", {
    title: "Products",
    products: products.docs,
    pagination: products.pagination,
    currentPage: products.page,
    totalPages: products.totalPages,
    welcome,
  });
});

// post para agregar productos
routerProd.post("/products", async (req, res) => {
  const products = req.body; // array of products
  console.log(products);
  const newProducts = await Promise.all(
    products.map(async (product) => {
      const {
        productName,
        description,
        code,
        price,
        thumbnail,
        stock,
        status,
        category,
      } = product;
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
      return newProduct;
    })
  );
  console.log(newProducts);
  res.render("products/all-products", {
    title: "Products",
    products: JSON.stringify(newProducts),
  });
});

export default routerProd;
