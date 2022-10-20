import express from "express";
import mongoose from "mongoose";

import checkAuth from "./utils/checkAuth.js";

import { registerValidation } from "./validations/auth.js";
import { getMe, login, register } from "./controllers/UserController.js";

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

app.post("/auth/login", login);
app.post("/auth/register", registerValidation, register);
app.get("/auth/me", checkAuth, getMe);

app.listen(4444, (err) => {
  if (err) {
    return console.log(err);
  }

  console.log("ok");
});
