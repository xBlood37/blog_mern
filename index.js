import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

import { validationResult } from "express-validator";
import { registerValidation } from "./validations/auth.js";

import UserModel from "./modules/user.js";
import checkAuth from "./utils/checkAuth.js";

mongoose
  .connect(
    "mongodb+srv://admin:wwwwww@cluster0.iadonfc.mongodb.net/blog?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("Connect");
  })
  .catch((err) => {
    console.log("Error: " + err);
  });

const app = express();

app.use(express.json());

app.post("/auth/login", async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isValidPassword = await bcrypt.compare(
      req.body.password,
      user._doc.passwordHash
    );

    if (!isValidPassword) {
      return res.status(400).json({
        message: "Wrong login or password",
      });
    }

    const token = jwt.sign(
      {
        _id: user._id,
      },
      "secret",
      { expiresIn: "30d" }
    );

    res.json({
      ...user._doc,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to login",
    });
  }
});

app.post("/auth/register", registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }

    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const doc = new UserModel({
      email: req.body.email,
      fullName: req.body.fullName,
      avatarUrl: req.body.avatarUrl,
      passwordHash,
    });

    const user = doc.save();

    const token = jwt.sign(
      {
        _id: user._id,
      },
      "secret",
      { expiresIn: "30d" }
    );

    res.json({
      ...user._doc,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to register",
    });
  }
});

app.get("/auth/me", checkAuth, async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({ ...user._doc });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to register",
    });
  }
});

app.listen(4444, (err) => {
  if (err) {
    return console.log(err);
  }

  console.log("ok");
});
