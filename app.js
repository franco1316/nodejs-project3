const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");

const { globalErrorHandler } = require("./controllers/errors");

const { users } = require("./views/users");
const { products } = require("./views/products");
const { carts } = require("./views/carts");

const app = express();

app.use(cors());

app.use(express.json());

app.use(helmet());

app.use(compression());

if (process.env.NODE_ENV === "development") app.use(morgan("dev"));
else app.use(morgan("combined"));

const limiter = rateLimit({
  max: 10000,
  windowMs: 1 * 60 * 60 * 1000,
  message: "Too many request from this Ip",
});

app.use(limiter);

app.use("/api/v1/users", users);
app.use("/api/v1/products", products);
app.use("/api/v1/cart", carts);

app.use("*", globalErrorHandler);

module.exports = { app };
