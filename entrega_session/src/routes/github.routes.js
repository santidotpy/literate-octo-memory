import { Router } from "express";
import passport from "passport";

const routerGH = Router();

routerGH.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] }),
  async (req, res) => {}
);

routerGH.get(
  "/github/callback",
  passport.authenticate("github"),
  async (req, res) => {
    req.session.user = req.user;
    res.redirect("../api/products");
  }
);

export default routerGH;
