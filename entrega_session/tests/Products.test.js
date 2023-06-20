import chai from "chai";
import supertest from "supertest";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { generateToken } from "../src/utils/jwt.js";
dotenv.config();

const expect = chai.expect;
const api = supertest("http://localhost:3000");

// Connect to MongoDB
before(async () => {
  const prueba = await mongoose.connect(process.env.mongoUrl);
});

// Close MongoDB connection after tests
after(async () => {
  await mongoose.disconnect();
});

describe("GET /api/products", function () {
  it("should return all products", async function () {
    this.timeout(8000);
    const { statusCode, ok, _body } = await api.get("/api/products");
    expect(statusCode).to.equal(200);
    expect(ok).to.equal(true);
    expect(_body.docs).to.be.an("array");
  });
});

describe("POST /api/products", function () {
  it("should create an incomplete product", async function () {
    this.timeout(8000);
    const token = generateToken({ user: { id: process.env.ADMIN_ID } });

    const product = {
      description: "Product description",
      thumbnail:
        "https://cdn3.iconfinder.com/data/icons/education-209/64/bus-vehicle-transport-school-128.png",
      code: 123456,
      stock: 10,
      category: "Testing",
    };
    const { statusCode, ok, _body } = await api
      .post("/api/products")
      .send(product)
      .set("Authorization", `Bearer ${token}`);

    // expect bad request
    expect(statusCode).to.equal(400);
    expect(ok).to.equal(false);
    expect(_body).to.have.property("message");
    expect(_body.message).to.equal("Missing fields: productName, price");
  });
});

describe("POST /api/products", function () {
  it("try to access a protected route while being unauthorized", async function () {
    this.timeout(8000);

    const product = {
      productName: "Product name",
      description: "Product description",
      price: 1000,
      thumbnail:
        "https://cdn3.iconfinder.com/data/icons/education-209/64/bus-vehicle-transport-school-128.png",
      code: 123456,
      stock: 10,
      category: "Testing",
    };
    const { statusCode, ok, _body } = await api
      .post("/api/products")
      .send(product);

    expect(statusCode).to.equal(401);
    expect(ok).to.equal(false);
    expect(_body).to.have.property("error");
    expect(_body.error).to.equal("No auth token");
  });
});
