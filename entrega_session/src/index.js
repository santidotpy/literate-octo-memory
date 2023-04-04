import "dotenv/config";
import express from "express";
import { engine } from "express-handlebars";
import { Server } from "socket.io";
import __dirname from "./path.js";
import path, { format } from "path";

//import { ProductMongo } from "./dao/MongoDB/models/Product.js";

import cookieParser from "cookie-parser";
import MongoStore from "connect-mongo";
import session from "express-session";
import passport from "passport";
import initializePassport from "./config/passport.js";

import routerProd from "./routes/products.routes.js";
import routerCart from "./routes/carts.routes.js";
import routerAuth from "./routes/auth.routes.js";

// inicializaciones
const app = express();
//const managerProduct = new ProductMongo();

app.set("port", process.env.PORT || 5000);
app.use(express.json());

// COOKIES
app.use(cookieParser(process.env.SIGNED_COOKIE));
app.use(
  session({
    secret: process.env.SECRET_SESSION,
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.mongoUrl,
      mongoOptions: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    }),
  })
);
// PASSPORT
initializePassport(passport);
app.use(passport.initialize());
app.use(passport.session());

app.set("views", path.join(__dirname, "views"));
app.engine(
  ".hbs",
  engine({
    defaultLayout: "main",
    layoutsDir: path.join(app.get("views"), "layouts"),
    partialsDir: path.join(app.get("views"), "partials"),
    extname: ".hbs",
  })
);
app.set("view engine", ".hbs");

// static files
app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: true }));

// socekts
const server = app.listen(app.get("port"), () =>
  console.log(`✅ Server running on: http://localhost:${app.get("port")}`)
);

const io = new Server(server);

io.on("connection", async (socket) => {
  console.log("New connection:", socket.id);
});

// routes

app.get("/", (req, res) => {
  res.redirect("/auth/login");
});

app.use("/api", routerProd);
app.use("/api", routerCart);
app.use("/auth", routerAuth);
