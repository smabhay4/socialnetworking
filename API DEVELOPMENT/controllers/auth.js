const User = require("../models/user");
const jwt = require("jsonwebtoken"); //for generating token
const expressJwt = require("express-jwt");
const _ = require("lodash");
const { sendEmail } = require("../helpers");
require("dotenv").config();

exports.signup = async (req, res) => {
  const userExists = await User.findOne({ email: req.body.email });
  if (userExists)
    return res.status(403).json({
      error: "THIS EMAIL IS ALREADY REGISTERED",
    });

  const user = await new User(req.body);
  await user.save();
  res.status(200).json({ message: `SIGN UP IS SUCCESSFUL ${user.name}` });
};

exports.signin = (req, res) => {
  const { email, password } = req.body;
  //find the user based on email
  User.findOne({ email }, (err, user) => {
    //if err or no user
    if (err || !user) {
      return res.status(401).json({
        error: "NO SUCH USER FOUND WITH THIS  EMAIL",
      });
    }
    //if user,authentication
    if (!user.authenticate(password)) {
      return res.status(401).json({
        error: "PASSWORD AND EMAIL DIDN'T MATCH",
      });
    }
    //generate a token with user id and secret
    const token = jwt.sign({ _id: user._id }, process.env.JWT_TOKEN); //user._id alloted by mongodb
    //persist the token as 't' in cookie with expiry date
    res.cookie("t", token, { expire: new Date() + 9999 });
    //return response with user and token to frontend client
    const { _id, name, email } = user;
    return res.json({ token, user: { _id, name, email } });
  });
};

exports.signout = (req, res) => {
  res.clearCookie("t");
  return res.json({ message: " SIGN OUT IS SUCCESSFUL" });
};

exports.requireSignin = expressJwt({
  //if the request is valid express jwt append the verified user id
  // in an auth key to the request

  secret: process.env.JWT_TOKEN,
  algorithms: ["HS256"],
  userProperty: "auth",
});

exports.forgotPassword = (req, res) => {
  if (!req.body) return res.status(400).json({ message: "No request body" });
  if (!req.body.email)
    return res.status(400).json({ message: "No Email in request body" });

  console.log("forgot password finding user with that email");
  const { email } = req.body;
  console.log("signin req.body", email);
  // find the user based on email
  User.findOne({ email }, (err, user) => {
    // if err or no user
    if (err || !user)
      return res.status("401").json({
        error: "User with that email does not exist!",
      });

    // generate a token with user id and secret
    const token = jwt.sign({ _id: user._id }, process.env.JWT_TOKEN);

    // email data
    const emailData = {
      from: "noreply@node-react.com",
      to: email,
      subject: "Password Reset Instructions",
      text: `Please use the following link to reset your password:http://localhost:3000/reset-password/${token}`,
      html: `<p>Please use the following link to reset your password:</p> <p>http://localhost:3000/reset-password/${token}</p>`,
    };

    return user.updateOne({ resetPasswordLink: token }, (err, success) => {
      if (err) {
        //log("mill gya error😒😒");
        return res.json({ message: err });
      } else {
        sendEmail(emailData);
        return res.status(200).json({
          message: `Email has been sent to ${email}. Follow the instructions to reset your password.`,
        });
      }
    });
  });
};

// to allow user to reset password
// first you will find the user in the database with user's resetPasswordLink
// user model's resetPasswordLink's value must match the token
// if the user's resetPasswordLink(token) matches the incoming req.body.resetPasswordLink(token)
// then we got the right user

exports.resetPassword = (req, res) => {
  const { resetPasswordLink, newPassword } = req.body;

  User.findOne({ resetPasswordLink }, (err, user) => {
    // if err or no user
    if (err || !user)
      return res.status("401").json({
        error: "Invalid Link!",
      });

    const updatedFields = {
      password: newPassword,
      resetPasswordLink: "",
    };

    user = _.extend(user, updatedFields);
    user.updated = Date.now();

    user.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }
      res.json({
        message: `Great! Now you can login with your new password.`,
      });
    });
  });
};

exports.socialLogin = (req, res) => {
  // try signup by finding user with req.email
  let user = User.findOne({ email: req.body.email }, (err, user) => {
    if (err || !user) {
      // create a new user and login
      user = new User(req.body);
      req.profile = user;
      user.save();
      // generate a token with user id and secret
      const token = jwt.sign(
        { _id: user._id, iss: "NODEAPI" },
        process.env.JWT_SECRET
      );
      res.cookie("t", token, { expire: new Date() + 9999 });
      // return response with user and token to frontend client
      const { _id, name, email } = user;
      return res.json({ token, user: { _id, name, email } });
    } else {
      // update existing user with new social info and login
      req.profile = user;
      user = _.extend(user, req.body);
      user.updated = Date.now();
      user.save();
      // generate a token with user id and secret
      const token = jwt.sign(
        { _id: user._id, iss: "NODEAPI" },
        process.env.JWT_SECRET
      );
      res.cookie("t", token, { expire: new Date() + 9999 });
      // return response with user and token to frontend client
      const { _id, name, email } = user;
      return res.json({ token, user: { _id, name, email } });
    }
  });
};
