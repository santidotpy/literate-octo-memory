import "dotenv/config";
import express from "express";
import { engine } from "express-handlebars";
import { Server } from "socket.io";
import __dirname from "./path.js";
import path, { format } from "path";

import cookieParser from "cookie-parser";
import MongoStore from "connect-mongo";
import session from "express-session";
import passport from "passport";
import swaggerJSdoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";
import initializePassport from "./config/passport.js";
import { MessageMongo } from "./dao/MongoDB/models/Message.js";

import routerProd from "./routes/products.routes.js";
import routerCart from "./routes/carts.routes.js";
import routerAuth from "./routes/auth.routes.js";
import routerGH from "./routes/github.routes.js";
import routerMsg from "./routes/msg.routes.js";
import routerTicket from "./routes/tickets.routes.js";
import { winstonLogger } from "./utils/logger.js";

// inicializaciones
const app = express();
const managerMessage = new MessageMongo();

app.set("port", process.env.PORT || 5000);
app.use(express.json());

// COOKIES
app.use(cookieParser(process.env.PRIVATE_KEY_JWT));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
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

// SWAGGER
const swaggerOptions = {
  definition: {
    openapi: "3.0.1",
    info: {
      title: "App Documentation",
      version: "0.5",
      description: "Documentation for a simple ecommerce",
      contact: {
        name: "Santiago",
      },
    },
  },
  apis: [`${__dirname}/docs/**/*.yaml`],
};
const swaggerDocs = swaggerJSdoc(swaggerOptions);

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

  socket.on("message", async (info) => {
    // const data = await managerMessage();
    // const managerMessage = new data.ManagerMessageMongoDB();
    managerMessage.addElements([info]).then(() => {
      managerMessage.getElements().then((mensajes) => {
        console.log(mensajes);
        socket.emmit("allMessages", mensajes);
      });
    });
  });

  socket.on("chat-message", async (data) => {
    // console.log(data);
    //save to db
    managerMessage.addElements([
      { username: data.username, message: data.message, email: data.email },
    ]);
    io.sockets.emit("chat-message", data);
  });

  socket.on("chat-typing", (data) => {
    socket.broadcast.emit("chat-typing", data);
  });
});

// routes
app.use(winstonLogger);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));

app.get("/", (req, res) => {
  res.redirect("/auth/login");
});

app.use(routerMsg);
app.use("/api", routerProd);
app.use("/api", routerCart);
app.use("/tickets", routerTicket);
app.use("/auth", routerAuth);
app.use("/auth", routerGH);
app.use("*", (req, res) => {
  res.status(404).send({ status: "error", message: "Not found" });
});
