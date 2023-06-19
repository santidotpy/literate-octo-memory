import chai from "chai";
import supertest from "supertest";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { faker } from "@faker-js/faker";
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

describe("POST /auth/signup", function () {
  it("should create a new user", async function () {
    this.timeout(8000);
    const user = {
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      age: 21,
    };
    const { statusCode, ok, _body } = await api.post("/auth/signup").send(user);

    expect(statusCode).to.equal(200);
    expect(ok).to.equal(true);
    expect(_body).to.have.property("status");
    expect(_body).to.have.property("message");
    expect(_body.status).to.equal("success");
    expect(_body.message).to.equal("User successfully created");
  });
});

describe("POST /auth/login", function () {
  it("should login a user", async function () {
    this.timeout(8000);
    const user = {
      email: process.env.testMail,
      password: process.env.testPass,
    };
    const { statusCode, ok, _body } = await api.post("/auth/login").send(user);
    expect(statusCode).to.equal(200);
    expect(ok).to.equal(true);
    expect(_body).to.have.property("token");
  });
});

// GET /users
describe("GET /auth/users", function () {
  it("should return all users", async function () {
    this.timeout(8000);
    const { statusCode, ok, _body } = await api.get("/auth/users");
    expect(statusCode).to.equal(200);
    expect(ok).to.equal(true);
    expect(_body.docs).to.be.an("array");
  });
});
