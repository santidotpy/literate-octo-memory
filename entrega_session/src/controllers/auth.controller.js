const getAuth = (req, res, next) => {
  if (req.session.login) {
    // if user is logged in
    res.redirect("api/products");
  } else {
    // if user is not logged in
    res.redirect("auth/login");
  }
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (email === "mail@mail.com" && password === "password123") {
    // if user is logged in

    req.session.login = true;
    res.redirect("api/products");
  } else {
    // if user is not logged in
    res.render("auth/login", { error: "Invalid credentials" });
  }
  next();
};

const destroySession = (req, res, next) => {
  if (req.session.login) {
    req.session.destroy(() => {
      res.redirect("api/login");
    });
  }
};
