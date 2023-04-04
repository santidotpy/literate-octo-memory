import local from "passport-local";
import passport from "passport";
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
};

export default initializePassport;
