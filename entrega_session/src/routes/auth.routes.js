import { Router } from "express";
import { UserMongo } from "../dao/MongoDB/models/User.js";
import passport from "passport";
import { passportError, authorization } from "../utils/messageError.js";
import { validatePassword, createHash } from "../utils/bcrypt.js";
import jwt from "jsonwebtoken";

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
  async (req, res, next) => {
    try {
      passport.authenticate(
        "jwt",
        { session: false },
        async (err, user, info) => {
          if (err) {
            return res.status(401).send("Error en consulta de token");
          }

          if (!user) {
            //El token no existe, entonces consulto por el usuario
            const { email, password } = req.body;
            const userBDD = await managerUser.getUserByEmail(email);

            if (!userBDD) {
              // UserBDD no encontrado en mi aplicacion
              return res.status(401).send("User no encontrado");
            }

            if (!validatePassword(password, userBDD.password)) {
              // Contraseña no es válida
              return res.status(401).send("Contraseña no valida");
            }

            // Ya que el usuario es valido, genero un nuevo token
            const token = jwt.sign(
              { user: { id: userBDD._id } },
              process.env.PRIVATE_KEY_JWT
            );
            res.cookie("jwt", token, { httpOnly: true });
            return res.status(200).json({ token });
          } else {
            //El token existe, asi que lo valido
            console.log("Pase?");
            const token = req.cookies.jwt;
            jwt.verify(
              token,
              process.env.PRIVATE_KEY_JWT,
              async (err, decodedToken) => {
                if (err) {
                  // Token no valido
                  return res.status(401).send("Credenciales no válidas");
                } else {
                  // Token valido
                  req.user = user;
                  next();
                }
              }
            );
          }
        }
      )(req, res, next);
    } catch (error) {
      res.status(500).send(`Ocurrio un error en Session, ${error}`);
    }
  }

  // ex estrategia local
  
  // passport.authenticate("login", {
  //   failureRedirect: "../auth/signup",
  //   failureMessage: true,
  // }),
  // async (req, res) => {
  //   try {
  //     if (!req.user) {
  //       res
  //         .status(401)
  //         .send({
  //           status: "error",
  //           message: req.session.messages[0] || "User not found",
  //         });
  //     }
  //     req.session.user = {
  //       name: req.user.name,
  //       email: req.user.email,
  //     };
  //     res
  //       .status(200)
  //       .send({
  //         status: "success",
  //         payload: req.user,
  //         message: "User logged in successfully",
  //       });
  //   } catch (e) {
  //     console.log(e);
  //     res
  //       .status(500)
  //       .send({ status: "error", message: "Internal Server Error" });
  //   }
  // }
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
  const page = req.query.page || 1;
  const users = await managerUser.getElements(page);
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
  passportError("jwt"),
  authorization(),
  async (req, res) => {
    const username = req.user.user.name;
    res.send({ message: `Welcome ${username}` });
  }
);

export default routerAuth;
