exports.createPostValidator = (req, res, next) => {
  //title validation of schema
  req.check("title", "write a title").notEmpty();
  req.check("title", "Title must be between 4 to 150 characters").isLength({
    min: 4,
    max: 150,
  });

  //body validation of schema
  req.check("title", "write a body").notEmpty();
  req.check("title", "Body must be between 4 to 150 characters").isLength({
    min: 4,
    max: 2000,
  });

  //check for errors
  const errors = req.validationErrors();

  //if error show the first one as they happen

  if (errors) {
    const firstError = errors.map((error) => error.msg)[0];
    return res.status(400).json({ error: firstError });
  }

  //proceed to next middleware
  next();
};

exports.userSignupValidator = (req, res, next) => {
  //name is not null and b/w 4-10 characters
  req.check("name", "name is required").notEmpty();

  req
    .check("email", "EMAIL MUST BE B/W 5 TO 32 CHARACTERS")
    .isLength({
      min: 4,
      max: 200,
    })
    .matches(/.+\@.+\..+/) //. represent string
    .withMessage("EMAIL MUST BE OF THE FORM a@b.c ");

  req
    .check("password")
    .isLength({ min: 6 })
    .withMessage("password must contain at least 6 charcters")
    .matches(/\d/) //\d represent alphanumeric
    .withMessage("password must contain a number");

  //check for errors
  const errors = req.validationErrors();

  //if error show the first one as they happen

  if (errors) {
    const firstError = errors.map((error) => error.msg)[0];
    return res.status(400).json({ error: firstError });
  }

  //proceed to next middleware
  next();
};

exports.passwordResetValidator = (req, res, next) => {
  // check for password
  req.check("newPassword", "Password is required").notEmpty();
  req
    .check("newPassword")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 chars long")
    .matches(/\d/)
    .withMessage("must contain a number")
    .withMessage("Password must contain a number");

  // check for errors
  const errors = req.validationErrors();
  // if error show the first one as they happen
  if (errors) {
    const firstError = errors.map((error) => error.msg)[0];
    return res.status(400).json({ error: firstError });
  }
  // proceed to next middleware or ...
  next();
};
