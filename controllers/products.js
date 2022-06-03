const jwt = require("jsonwebtoken");

const { Product } = require("../models/products");
const { Category } = require("../models/categories");
const { User } = require("../models/users");

const { catchAsync } = require("../utils/catchAsync");

const getAllProducts = catchAsync(async (req, res, next) => {
  const allProducts = await Product.findAll({
    where: {
      status: "active",
    },
    include: [
      { model: Category, attributes: ["name"] },
      { model: User, attributes: ["username", "email"] },
    ],
  });

  res.status(200).json({
    allProducts,
  });
});

const getProductById = catchAsync(async (req, res, next) => {
  const { product } = req;

  res.status(200).json({ product });
});

const createProduct = catchAsync(async (req, res, next) => {
  const { title, description, price, quantity, categoryId } = req.body;
  const { sessionUser } = req;

  const newProduct = await Product.create({
    title,
    description,
    quantity,
    categoryId,
    price,
    userId: sessionUser.id,
    status: "active",
  });

  res.status(201).json({
    newProduct,
  });
});

const updateProduct = catchAsync(async (req, res, next) => {
  const { title, description, price, quantity } = req.body;
  const { product } = req;

  await product.update({
    title,
    description,
    price,
    quantity,
  });

  res.status(200).json({ status: "success" });
});

const disableProduct = catchAsync(async (req, res, next) => {
  const { product } = req;

  await product.update({
    status: "disable",
  });

  res.status(200).json({
    status: "success",
  });
});

const getAllCategories = catchAsync(async (req, res, next) => {
  const AllCategories = await Category.findAll({
    where: {
      status: "active",
    },
  });

  res.status(200).json({ AllCategories });
});

const addNewCategory = catchAsync(async (req, res, next) => {
  const { name } = req.body;

  const newCategory = await Category.create({
    name,
    status: "active",
  });

  res.status(201).json({ newCategory });
});

const updateNameCategory = catchAsync(async (req, res, next) => {
  const { name } = req.body;
  const { id } = req.params;

  const category = await Category.findOne({
    where: {
      status: "active",
      id,
    },
  });

  await category.update({
    name,
  });

  res.status(200).json({ status: "success" });
});

module.exports = {
  getAllProducts,
  createProduct,
  getProductById,
  updateProduct,
  disableProduct,
  getAllCategories,
  addNewCategory,
  updateNameCategory,
};
