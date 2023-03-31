import { Router } from "express";
import { UserMongo } from "../dao/MongoDB/models/User.js";

const routerAuth = Router();
const managerUser = new UserMongo();

routerAuth.get("/signup", (req, res) => {
  res.render("auth/signup");
});

routerAuth.post("/signup", async (req, res) => {
  const errors = [];
  const { name, email, password } = req.body;
  console.log(email);
  if (password.length < 8) {
    errors.push({ text: "Password must be at least 8 characters" });
  }
  if (errors.length > 0) {
    res.render("auth/signup", {
      errors,
      name,
      email,
    });
  } else {
    const emailUser = await managerUser.getUserByEmail(email);
    if (emailUser) {
      errors.push({ text: "The Email is already in use." });
      res.render("auth/signup", {
        errors,
        name,
      });
    } else {
      await managerUser.addElements([
        {
          name,
          email,
          password,
        },
      ]);
      res.redirect("/auth/login");
    }
  }
});

routerAuth.get("/login", (req, res) => {
  if (req.session.login) {
    res.redirect("../api/products");
  } else {
    res.render("auth/login");
  }
});

routerAuth.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await managerUser.getUserByEmail(email);

  try {
    //if (email === "adminCoder@coder.com" && password === "adminCod3r123") {
    if (user && user.password === password) {
      // if user is logged in

      req.session.login = true;
      const name = user.name;
      res.redirect("../api/products?name=" + name);
      //res.redirect("../api/products");
    } else {
      // if user is not logged in
      res.render("auth/login");
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

routerAuth.get("/logout", (req, res) => {
  if (req.session.login) {
    req.session.destroy(() => {
      console.log("Session destroyed");
      res.redirect("../");
    });
    return;
  }

  res.redirect("../");
});

routerAuth.get("/users", async (req, res) => {
  const users = await managerUser.getElements();
  res.send(users);
});

export default routerAuth;
