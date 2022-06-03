const { Product } = require("../models/products");
const { User } = require("../models/users");

const { catchAsync } = require("../utils/catchAsync");
const { AppError } = require("../utils/appError");

const protectProductOwner = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const {sessionUser} = req
  const product = await Product.findOne({
    where: {
      id,
    },
  });
  const user = await User.findOne({
    where: {
      id: product.userId,
    },
  });
  if(user.id !== sessionUser.id){
    return next(new AppError("You are not the owner of that product", 400));
  }
  next();
});

const productExist = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findOne({
    where: {
      id,
      status: "active",
    },
  });

  if (!product) {
    return next(new AppError("Could not find product by given id", 404));
  }

  req.product = product;
  next();
});

module.exports = { productExist, protectProductOwner };
