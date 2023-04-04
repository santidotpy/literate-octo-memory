import local from "passport-local";
import passport from "passport";
import gitHubStrategy from "passport-github2";
import { managerUser } from "../routes/auth.routes.js";
import { createHash, validatePassword } from "../utils/bcrypt.js";

const LocalStrategy = local.Strategy;

const initializePassport = (passport) => {
  const authenticateUser = async (mail, password, done) => {
    try {
      const user = await managerUser.getUserByEmail(mail);

      if (!user) {
        //Usuario no encontrado
        return done(null, false);
      }
      if (validatePassword(password, user.password)) {
        //Usuario y contraseña validos
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
      console.log(userCreated);
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
      console.log(accessToken);
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
      { usernameField: "email", passReqToCallback: true },
      registerUser
    )
  );
  passport.use(
    "login",
    new LocalStrategy({ usernameField: "email" }, authenticateUser)
  );
  passport.serializeUser((user, done) => done(null, user._id));
  passport.deserializeUser(async (id, done) => {
    return done(null, await managerUser.getElementById(id));
  });

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
};

export default initializePassport;
