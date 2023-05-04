import local from "passport-local";
import passport from "passport";
import gitHubStrategy from "passport-github2";
import { strategyJWT } from "./strategies/jwtStrategy.js";
import { managerUser } from "../controllers/auth.controller.js";
import { createCart } from "../controllers/cart.controller.js";
import { createHash, validatePassword } from "../utils/bcrypt.js";
import { generateToken } from "../utils/jwt.js";

const LocalStrategy = local.Strategy;

const initializePassport = (passport) => {
  const cookieExtractor = (req) => {
    let token = null;
    if (req && req.cookies) {
      token = req.cookies["jwt"];
    }
    return token;
  };

  const authenticateUser = async (mail, password, done) => {
    try {
      const user = await managerUser.getUserByEmail(mail);

      if (!user) {
        //Usuario no encontrado
        return done(null, false, { message: "User not found" });
      }
      if (validatePassword(password, user.password)) {
        //Usuario y contraseña validos
        const token = generateToken({ user });
        console.log({ token });
        // const token = generateToken(user.toJSON()); // dos maneras de hacerlo
        return done(null, user);
      }

      return done(null, false); //Contraseña no valida
    } catch (error) {
      return done(error);
    }
  };

  const registerUser = async (req, mail, password, done) => {
    //const { name, email } = req.body;
    const cart = await createCart();
    const id_cart = cart[0]._id.toString();

    const { first_name, last_name, email, age } = req.body;
    let { isadmin } = req.body;
    isadmin = isadmin ? isadmin : false;
    try {
      const user = await managerUser.getUserByEmail(mail);
      if (user) {
        console.log("User already exists");
        return done(null, false);
      }
      const passwordHash = createHash(password);

      const userCreated = await managerUser.addElements([
        {
          first_name,
          last_name,
          email,
          password: passwordHash,
          age,
          isadmin,
          id_cart,
        },
      ]);
      const token = generateToken({ userCreated });
      return done(null, userCreated);
    } catch (error) {
      return done(error);
    }
  };

  const gitHubAuthenticate = async (
    accessToken,
    refreshToken,
    profile,
    done
  ) => {
    try {
      const userFound = await managerUser.getUserByEmail(profile._json.email);
      if (userFound) {
        return done(null, userFound);
      }
      const userCreated = await managerUser.addElements([
        {
          name: profile._json.name,
          email: profile._json.email,
          password: " ",
        },
      ]);
      return done(null, userCreated);
    } catch (error) {
      return done(error);
    }
  };
  passport.use(
    "register",
    new LocalStrategy(
      { passReqToCallback: true, usernameField: "email" },
      registerUser
    )
  );
  passport.use(
    "login",
    new LocalStrategy({ usernameField: "email" }, authenticateUser)
  );

  passport.use(
    "github",
    new gitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/github/callback",
      },
      gitHubAuthenticate
    )
  );

  passport.use("jwt", strategyJWT);

  //Inicializar la session del user
  passport.serializeUser((user, done) => {
    //check is user is an array
    if (Array.isArray(user)) {
      done(null, user[0]._id);
    } else {
      done(null, user._id);
    }
  });

  //Eliminar la session del user
  passport.deserializeUser(async (id, done) => {
    const user = managerUser.getElementById(id);
    done(null, user);
  });
};

export default initializePassport;
