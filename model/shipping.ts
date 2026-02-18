import sequelize from "@/lib/database";
import { DataTypes } from "sequelize";

const Shipping = sequelize.define(
  "Shipping",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    pincode_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    min_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    max_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    shipping_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active",
    },
  },
  {
    tableName: "shipping_rates",
    timestamps: true,
  },
);

export default Shipping;
