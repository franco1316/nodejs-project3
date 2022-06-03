const express = require("express");

const {
  authenticate,
  protectToken,
  userExist,
} = require("../middlewares/users");

const {
  createUserValidations,
  checkValidations,
} = require("../middlewares/validations");

const {
  createUser,
  login,
  getAllProducts,
  getAllOrders,
  getOrder,
  updateUser,
  disableUser,
} = require("../controllers/users");

const router = express.Router();

router.post("/", createUserValidations, checkValidations, createUser);
router.post("/login", login);

router.use(protectToken);

router.get("/me", getAllProducts);
router.get("/orders", getAllOrders);
router.get("/orders/:id", getOrder);

router
  .use(userExist, authenticate)
  .route("/:id")
  .patch(updateUser)
  .delete(disableUser);

module.exports = { users: router };
