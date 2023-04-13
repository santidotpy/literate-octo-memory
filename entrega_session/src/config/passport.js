import local from "passport-local";
import passport from "passport";
import jwt from "passport-jwt";
import gitHubStrategy from "passport-github2";
import { managerUser } from "../routes/auth.routes.js";
import { createHash, validatePassword } from "../utils/bcrypt.js";
import { generateToken } from "../utils/jwt.js";
import * as mid from "../middlewares/index.js";

const LocalStrategy = local.Strategy;
const JWTSrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt;

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
        console.log(token);
        // const token = generateToken(user.toJSON()); // dos maneras de hacerlo
        return done(null, user);
      }

      return done(null, false); //Contraseña no valida
    } catch (error) {
      return done(error);
    }
  };

  const registerUser = async (req, mail, password, done) => {
    const { name, email } = req.body;
    try {
      const user = await managerUser.getUserByEmail(mail);
      if (user) {
        console.log("User already exists");
        return done(null, false);
      }
      const passwordHash = createHash(password);

      const userCreated = await managerUser.addElements([
        {
          name,
          email,
          password: passwordHash,
        },
      ]);
      //console.log(userCreated);
      const token = generateToken({userCreated});
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
      //console.log(accessToken);
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

  passport.use(
    new JWTSrategy(
      {
        jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
        secretOrKey: process.env.PRIVATE_KEY_JWT,
      },
      async (jwtPayload, done) => {
        try {
          // const user = await managerUser.getUserByEmail(jwtPayload.mail);
          // if (user) {
          //   return done(null, user);
          // }
          // return done(null, false);
          return done(null, jwtPayload);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  //Inicializar la session del user
  passport.serializeUser((user, done) => {
    //console.log(user);
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
