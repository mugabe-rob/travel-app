const express = require("express");
const ussdRoute = require("./index");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/", ussdRoute);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
