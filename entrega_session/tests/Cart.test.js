import chai from "chai";
import supertest from "supertest";
import mongoose from "mongoose";
import { generateToken } from "../src/utils/jwt.js";
import dotenv from "dotenv";
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

describe("GET /api/carts", function () {
  it("should return all carts but I no admin", async function () {
    this.timeout(8000);
    const token = generateToken({ user: { id: process.env.NO_ADMIN_ID } });
    const { statusCode, ok, _body } = await api
      .get("/api/carts")
      .set("Authorization", `Bearer ${token}`);

    expect(statusCode).to.equal(403);
    expect(ok).to.equal(false);
    expect(_body).to.have.property("error");
    expect(_body.error).to.equal("You do not have permission to access");
  });
});

describe("GET /api/cart", function () {
  it("should return a cart", async function () {
    this.timeout(8000);
    const token = generateToken({ user: { id: process.env.NO_ADMIN_ID } });
    const { statusCode, ok, _body } = await api
      .get("/api/cart")
      .query({ id: process.env.NO_ADMIN_CART_ID })
      .set("Authorization", `Bearer ${token}`);

    expect(statusCode).to.equal(200);
    expect(ok).to.equal(true);
    expect(_body).to.have.property("_id");
    expect(_body._id).to.be.equal(process.env.NO_ADMIN_CART_ID);
    expect(_body).to.have.property("products");
    expect(_body.products).to.be.an("array");
  });
});

describe("DELETE /api/cart", function () {
  it("should delete all products from a cart", async function () {
    this.timeout(8000);
    const token = generateToken({ user: { id: process.env.NO_ADMIN_ID } });
    const { statusCode, ok, _body } = await api
      .delete("/api/cart")
      .query({ cartId: process.env.NO_ADMIN_CART_ID })
      .set("Authorization", `Bearer ${token}`);

    expect(statusCode).to.equal(200);
    expect(ok).to.equal(true);
    expect(_body).to.have.property("message");
    expect(_body.message).to.equal("Cart emptied");
  });
});
