import sequelize from "@/lib/database";
import { DataTypes } from "sequelize";

const Pincode = sequelize.define(
  "Pincode",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    city_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    pincode: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    area_name: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active",
    },
  },
  {
    tableName: "pincodes",
    timestamps: true,
  },
);

export default Pincode;
