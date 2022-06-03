const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

const { catchAsync } = require("../utils/catchAsync");
const { AppError } = require("../utils/appError");

const { User } = require("../models/users");
const { Product } = require("../models/products");
const { Order } = require("../models/orders");
const { Cart } = require("../models/carts");
const { Category } = require("../models/categories");
const { ProductsInCart } = require("../models/productsInCart");

dotenv.config({ path: "./config.env" });

const createUser = catchAsync(async (req, res, next) => {
  const { username, email, password, role } = req.body;

  const salt = await bcrypt.genSalt(12);
  const hashPassword = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    username,
    email,
    password: hashPassword,
    role,
    status: "active",
  });

  newUser.password = undefined;

  res.status(201).json({
    newUser,
  });
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({
    where: { email, status: "active" },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError("Invalid credentials", 400));
  }

  const token = await jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  user.password = undefined;

  res.status(200).json({ token, user });
});

const getAllProducts = catchAsync(async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = await jwt.decode(token);

  const allProducts = await Product.findAll({
    where: {
      userId: decoded.id,
      status: "active",
    },
  });

  res.status(200).json({
    allProducts,
  });
});

const getAllOrders = catchAsync(async (req, res, next) => {
  const { id } = req.sessionUser;

  const orders = await Order.findAll({
    attributes: ["id", "totalPrice", "createdAt"],
    where: { userId: id },
    include: [
      {
        model: Cart,
        attributes: ["id", "status"],
        include: [
          {
            model: Product,
            attributes: ["id", "title", "description", "price"],
            include: [
              {
                model: Category,
                attributes: ["name"],
              },
            ],
          },
        ],
      },
    ],
  });

  res.status(200).json({
    status: "success",
    orders,
  });
});

const getOrder = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;
  const { id } = req.params;

  const order = await Order.findOne({
    attributes: ["id", "totalPrice", "createdAt"],
    where: { userId: sessionUser.id, id },
    include: [
      {
        model: Cart,
        attributes: ["id", "status"],
        include: [
          {
            model: Product,
            attributes: ["id", "title", "description", "price"],
            include: [
              {
                model: Category,
                attributes: ["name"],
              },
            ],
          },
        ],
      },
    ],
  });

  res.status(200).json({
    status: "success",
    order,
  });
});

const updateUser = catchAsync(async (req, res, next) => {
  const { username, email } = req.body;
  const { user } = req;

  await user.update({
    username,
    email,
  });

  res.status(200).json({
    status: "success",
  });
});

const disableUser = catchAsync(async (req, res, next) => {
  const { user } = req;

  user.update({ status: "disable" });

  res.status(200).json({
    status: "success",
  });
});

module.exports = {
  createUser,
  login,
  getAllProducts,
  getAllOrders,
  getOrder,
  updateUser,
  disableUser,
};
