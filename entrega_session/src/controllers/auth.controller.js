import passport from "passport";
import jwt from "jsonwebtoken";
import { validatePassword } from "../utils/bcrypt.js";
import { UserMongo } from "../dao/MongoDB/models/User.js";

export const managerUser = new UserMongo();

export const getUsers = async (req, res, page) => {
  try {
    const page = req.query.page || 1;
    const users = await managerUser.getElements(page);
    res.send(users);
  } catch (e) {
    res.status(500).send({ status: "error", message: "Internal Server Error" });
  }
};

export const loginValidation = async (req, res, next) => {
  try {
    passport.authenticate('jwt', { session: false }, async (err, user, info) => {
      if (err) {
          return res.status(401).send("Error authenticating user")
      }
      if (user) {
          //El token no existe, entonces consulto por el usuario
          const { email, password } = req.body
          const userBDD = await managerUser.getUserByEmail(email)

          if (!userBDD) {
              // UserBDD no encontrado en mi aplicacion
              return res.status(401).send("User not found")
          }

          if (!validatePassword(password, userBDD.password)) {
              // Contraseña no es válida
              return res.status(401).send("Please check your credentials")
          }

          // Ya que el usuario es valido, genero un nuevo token
          const token = jwt.sign({ user: { id: userBDD._id } }, process.env.PRIVATE_KEY_JWT)
          res.cookie('jwt', token, { httpOnly: true })
          return res.status(200).json({ token })
      } else {
          //El token existe, asi que lo valido
          const token = req.cookies.jwt;
          jwt.verify(token, process.env.PRIVATE_KEY_JWT, async (err, decodedToken) => {
            if (err) {
              // Token no valido
              return res.status(401).send("Please check your credentials")
            } else {
              // Token valido
                  req.user = user
                  next()
              }
          })
      }

  })(req, res, next)
} catch (error) {
  res.status(500).send(`Ocurrio un error en Session, ${error}`)
}
};
