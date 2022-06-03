const express = require("express");

const { protectToken, protectAdmin } = require("../middlewares/users");

const {
  createCartValidations,
  checkValidations,
} = require("../middlewares/validations");

const { stockProductsInCart, cartExist } = require("../middlewares/carts");

const {
  addProductToCart,
  updateProductInCart,
  purchaseCart,
  removeProductFromCart,
} = require("../controllers/carts");

const router = express.Router();

router.use(protectToken, cartExist);

router.post(
  "/add-product",
  createCartValidations,
  checkValidations,
  stockProductsInCart,
  addProductToCart
);

router.patch("/update-cart", stockProductsInCart, updateProductInCart);

router.post("/purchase", purchaseCart);

router.delete("/:productId", removeProductFromCart);

module.exports = { carts: router };
