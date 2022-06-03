const { validationResult } = require("express-validator");
const { body } = require("express-validator");
const { AppError } = require("../utils/appError");

const createUserValidations = [
  body("username")
    .notEmpty()
    .withMessage("The property username cannot be empty"),
  body("email")
    .notEmpty()
    .withMessage("The property email cannot be empty")
    .isEmail()
    .withMessage("Email must be in a valid format"),
  body("password")
    .notEmpty()
    .withMessage("The property password cannot be empty")
    .isLength({
      min: 8,
    })
    .withMessage("Password must be at least 8 characters"),
];

const createCategoryValidations = [
  body("name").notEmpty().withMessage("Name cannot be empty"),
];

const createProductValidations = [
  body("title")
    .notEmpty()
    .withMessage("The title cannot be empty")
    .isString()
    .withMessage("The title must be a string"),
  body("description")
    .isString()
    .withMessage("The description must be a string"),
  body("quantity")
    .notEmpty()
    .withMessage("Quantity of products cannot be empty")
    .isInt({ min: 1 })
    .withMessage("The quantity of products was invalid"),
  body("price")
    .notEmpty()
    .withMessage("Price cannot be empty")
    .isFloat({ min: 0 })
    .withMessage("Price must be an integer"),
  body("categoryId")
    .isInt({ min: 1 })
    .withMessage("CategoryId should be a valid category"),
];

const createCartValidations = [
  body("userId")
  .notEmpty().withMessage("Name cannot be empty")
  .isInt({ min: 1 })
  .withMessage("UserId should be a valid category"),
];

const checkValidations = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    const messages = errors.array().map(({ msg }) => msg);

    const eMessages = messages.join(".\n");

    return next(new AppError(eMessages, 400));
  }

  next();
};

module.exports = {
  createUserValidations,
  createCategoryValidations,
  createProductValidations,
  createCartValidations,
  checkValidations,
};
