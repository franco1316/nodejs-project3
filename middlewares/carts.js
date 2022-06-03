const { catchAsync } = require("../utils/catchAsync");
const { AppError } = require("../utils/appError");

const { Cart } = require("../models/carts");
const { ProductsInCart } = require("../models/productsInCart");
const { Product } = require("../models/products");

const stockProductsInCart = catchAsync(async (req, res, next) => {
  const { id } = req.sessionUser;

  const cart = await Cart.findOne({
    where: {
      userId: id,
      status: "active",
    },
    include: [
      {
        model: ProductsInCart,
        where: {
          cartId: cart.id,
          status: "active",
        },
        attributes: ["cartId", "quantity"],
        include: [
          {
            model: Product,
            where: {
              id: cart.productsInCart.productId,
              status: "active",
            },
            attributes: ["title", "price", "quantity", "status", "userId"],
          },
        ],
      },
    ],
  });

  if (cart.productsInCart.quantity > cart.productsInCart.product.quantity) {
    return next(
      new AppError(
        "The request of this product cannot be major of the stock product",
        400
      )
    );
  }
  next();
});

const cartExist = catchAsync(async (req, res, next) => {
  const { id } = req.sessionUser;

  const cart = await Cart.findOne({
    where: {
      userId: id,
      status: "active",
    },
  });

  if (!cart) {
    return next(new AppError("The cart does not exist yet", 404));
  }

  next();
});

module.exports = {
  stockProductsInCart,
  cartExist,
};
