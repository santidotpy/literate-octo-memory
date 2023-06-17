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
    passport.authenticate(
      "jwt",
      { session: false },
      async (err, user, info) => {
        if (err) {
          throw new Error("Error authenticating user");
        }
        if (!user) {
          await loginUser(req, res);
        } else {
          await validateToken(req, res, next);
        }
      }
    )(req, res, next);
  } catch (error) {
    res.status(500).send(`An error occurred in Session: ${error}`);
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const userBDD = await managerUser.getUserByEmail(email);
  if (!userBDD) {
    return res.status(401).send("User not found");
  }
  if (!validatePassword(password, userBDD.password)) {
    return res.status(401).send("Invalid password");
  }
  const token = generateToken(userBDD._id);
  setCookie(res, token);
  return res.status(200).json({ token });
};

const validateToken = async (req, res, next) => {
  const token = req.cookies.jwt;
  try {
    const decodedToken = jwt.verify(token, process.env.PRIVATE_KEY_JWT);
    req.user = decodedToken.user;
    next();
  } catch (err) {
    return res.status(401).send("Invalid token");
  }
};

const generateToken = (userId) => {
  return jwt.sign({ user: { id: userId } }, process.env.PRIVATE_KEY_JWT, {
    expiresIn: "1h",
  });
};

const setCookie = (res, token) => {
  res.cookie("jwt", token, { httpOnly: true });
};

export const getUserEmail = async (userId) => {
  const user = await managerUser.getElementById(userId);
  return user.email;
};
