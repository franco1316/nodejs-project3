const express = require("express");

const {
  createProductValidations,
  checkValidations,
} = require("../middlewares/validations");

const { protectToken } = require("../middlewares/users");
const {
  productExist,
  protectProductOwner,
} = require("../middlewares/products");

const {
  getAllProducts,
  createProduct,
  getProductById,
  updateProduct,
  disableProduct,
  getAllCategories,
  addNewCategory,
  updateNameCategory,
} = require("../controllers/products");

const router = express.Router();

router
  .route("/")
  .get(getAllProducts)
  .post(protectToken, createProductValidations, checkValidations, createProduct);

router.get(getAllCategories);

router.use(protectToken);

router.post("/categories", addNewCategory);

router.patch("/categories/:id", updateNameCategory);

router
  .use("/:id", productExist)
  .route("/:id")
  .get(getProductById)
  .patch(protectProductOwner, updateProduct)
  .delete(protectProductOwner, disableProduct);

module.exports = { products: router };
