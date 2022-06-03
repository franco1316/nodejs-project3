const { DataTypes } = require("sequelize");
const { db } = require("../utils/database");

const Cart = db.define("cart", {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: true,
    type: DataTypes.INTEGER,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "active",
  },
});

module.exports = { Cart };
