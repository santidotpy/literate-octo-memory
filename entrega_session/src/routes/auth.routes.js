import { Router } from "express";
import { UserMongo } from "../dao/MongoDB/models/User.js";
import passport from "passport";
import { passportError } from "../utils/messageError.js";

const routerAuth = Router();
export const managerUser = new UserMongo();

routerAuth.get("/signup", (req, res) => {
  res.render("auth/signup");
});

routerAuth.post(
  "/signup",
  passport.authenticate("register"),
  async (req, res) => {
    res.send({ status: "success", message: "User created successfully" });
  }
);

routerAuth.get("/login", (req, res) => {
  if (req.session.login) {
    res.redirect("../api/products");
  } else {
    res.render("auth/login");
  }
});

routerAuth.post(
  "/login",
  passport.authenticate("login", {
    failureRedirect: "../auth/signup",
    failureMessage: true,
  }),
  async (req, res) => {
    try {
      if (!req.user) {
        res
          .status(401)
          .send({
            status: "error",
            message: req.session.messages[0] || "User not found",
          });
      }
      req.session.user = {
        name: req.user.name,
        email: req.user.email,
      };
      res
        .status(200)
        .send({
          status: "success",
          payload: req.user,
          message: "User logged in successfully",
        });
    } catch (e) {
      console.log(e);
      res
        .status(500)
        .send({ status: "error", message: "Internal Server Error" });
    }
  }
);

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

routerAuth.get(
  "/testJWT",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const username = req.user.user.name;
    res.send({ status: "success", message: `Welcome ${username}` });
  }
);

routerAuth.get(
  "/current",
  passportError("jwt"), async (req, res) => {
    const username = req.user.user.name;
    res.send({message: `Welcome ${username}`});
  }
);

export default routerAuth;
