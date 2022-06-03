const { User } = require("./users");
const { Product } = require("./products");
const { ProductImg } = require("./productImgs");
const { Category } = require("./categories");
const { ProductsInCart } = require("./productsInCart");
const { Cart } = require("./carts");
const { Order } = require("./orders");

const initModels = () => {
  User.hasMany(Product, { foreignKey: "userId" });
  Product.belongsTo(User, { foreignKey: "id" });

  User.hasOne(Cart, { foreignKey: "userId" });
  Cart.belongsTo(User, { foreignKey: "id" });

  Product.hasMany(ProductImg, { foreignKey: "productId" });
  ProductImg.belongsTo(Product, { foreignKey: "id" });

  Product.hasOne(ProductsInCart, { foreignKey: "productId" });
  ProductsInCart.belongsTo(Product, { foreignKey: "id" });

  Product.hasOne(Category, { foreignKey: "id" });
  Category.belongsTo(Product, { foreignKey: "categoryId" });

  Cart.hasMany(ProductsInCart, { foreignKey: "cartId" });
  ProductsInCart.belongsTo(Cart, { foreignKey: "id" });

  Cart.hasOne(Order, { foreignKey: "cartId" });
  Order.belongsTo(Cart, { foreignKey: "id" });

  Order.hasMany(User, { foreignKey: "id" });
  User.belongsTo(Order, { foreignKey: "userId" });
};

module.exports = { initModels };
