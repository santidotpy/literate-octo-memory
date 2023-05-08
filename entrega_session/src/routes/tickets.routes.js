import { Router } from "express";
import { authorization, passportError } from "../utils/messageError.js";
import { getTickets } from "../controllers/cart.controller.js";

const routerTicket = Router();

routerTicket.get("/all", passportError("jwt"), authorization(), getTickets);

export default routerTicket;
