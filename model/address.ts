import sequelize from "@/lib/database";
import { DataTypes } from "sequelize";

const Address = sequelize.define(
  "Address",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    full_name: {
      type: DataTypes.STRING(191),
      allowNull: false,
    },
    mobile: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    alternate_mobile: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    address_line_1: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    address_line_2: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    landmark: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },
    country_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    state_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    city_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    pincode_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    postal_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    address_type: {
      type: DataTypes.ENUM("home", "office", "other"),
      allowNull: false,
      defaultValue: "home",
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active",
    },
  },
  {
    tableName: "addresses",
    timestamps: true,
  },
);

export default Address;
