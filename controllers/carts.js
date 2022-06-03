const jwt = require("jsonwebtoken");

const { Cart } = require("../models/carts");
const { ProductsInCart } = require("../models/productsInCart");
const { Product } = require("../models/products");
const { Order } = require("../models/orders");

const { catchAsync } = require("../utils/catchAsync");
const { AppError } = require("../utils/appError");

const addProductToCart = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const { sessionUser } = req;

  const product = await Product.findOne({
    where: {
      id: productId,
      status: "active",
    },
  });

  const cart = await Cart.findOne({
    where: {
      userId: sessionUser.id,
      status: "active",
    },
  });

  if (!cart) {
    await Cart.create({ userId: sessionUser.id, status: "active" });
  } else if (cart.status === "empty") {
    await cart.update({ status: "active" });
  }

  const productsInCart = await ProductsInCart.create({
    cartId: cart.id,
    productId,
    quantity,
  });

  if (productsInCart && productsInCart.status === "active") {
    return next(
      new AppError("You already have that product in your cart", 400)
    );
  }

  res.status(201).json({ status: "success", product, productsInCart });
});

const updateProductInCart = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const { sessionUser } = req;

  const cart = await Cart.findOne({
    where: { status: "active", userId: sessionUser.id },
  });

  if (!cart) {
    return next(new AppError("Must create a cart first", 400));
  }

  const productsInCart = await ProductsInCart.findOne({
    where: {
      status: "active",
      cartId: cart.id,
      productId,
    },
    include: [
      {
        model: Product,
      },
    ],
  });

  if (!productsInCart) {
    return next(new AppError("This product does not exist in your cart", 404));
  }

  if (quantity < 0 || quantity > productsInCart.product.quantity) {
    return next(
      new AppError(
        `Invalid selected quantity, this product only has ${productsInCart.product.quantity} items available`,
        400
      )
    );
  }

  if (quantity === 0) {
    await productsInCart.update({ quantity, status: "removed" });
  } else {
    await productsInCart.update({ quantity, status: "active" });
  }

  res.status(200).json({ status: "success", newQuantity: quantity });
});

const purchaseCart = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const myCart = await Cart.findOne({
    where: {
      userId: sessionUser.id,
      status: "active",
    },
    include: [
      {
        model: ProductsInCart,
        where: { status: "active" },
        include: [
          {
            model: Product,
          },
        ],
      },
    ],
  });

  if (!myCart) {
    return next(new AppError("This user does not have a cart yet.", 400));
  }

  let totalPrice = 0;

  const cartPromises = myCart.productInCarts.map(async (productInCart) => {
    const quantity = productInCart.product.quantity - productInCart.quantity;

    await productInCart.product.update({ quantity });

    totalPrice += productInCart.quantity * +productInCart.product.price;

    return await productInCart.update({ status: "purchased" });
  });

  await Promise.all(cartPromises);

  const newOrder = await Order.create({
    userId: sessionUser.id,
    cartId: myCart.id,
    totalPrice,
  });

  await myCart.update({ status: "purchased" });

  res.status(200).json({ status: "success", newOrder });
});

const removeProductFromCart = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const { sessionUser } = req;


  const myCart = await Cart.findOne({
    where: {
      userId: sessionUser.id,
      status: "active",
    },
    include: [
      {
        model: ProductsInCart,
        where: { productId },
        include: [
          {
            model: Product,
            attributes: ["id", "quantity", "status", "title", "price"],
          },
        ],
      },
    ],
  });

  const promiseProductsInCart = myCart.productsInCart.map(async (product) => {
    const myProduct = await Product.findOne({
      where: { id: product.productId },
    });

    if(myProduct.quantity === 0)
      return await myProduct.update({ status: "remove" });
  });

  await Promise.all(promiseProductsInCart);

  res.status(200).json({ status: "success" });
});

module.exports = {
  addProductToCart,
  updateProductInCart,
  purchaseCart,
  removeProductFromCart,
};
