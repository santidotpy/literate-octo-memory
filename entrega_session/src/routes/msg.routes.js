import { Router } from "express";
import {
  passportError,
  authorization,
  authorizationUser,
} from "../utils/messageError.js";

const routerMsg = Router();

routerMsg.get(
  "/chat",
  passportError("jwt"),
  authorizationUser(),
  (req, res) => {
    res.render("chat", {
      title: "Chat",
    });
  }
);

export default routerMsg;
