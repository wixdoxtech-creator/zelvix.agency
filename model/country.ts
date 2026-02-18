import sequelize from "@/lib/database";
import { DataTypes } from "sequelize";

const Country = sequelize.define(
  "Country",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(191),
      allowNull: false,
      unique: true,
    },
    iso_code: {
      type: DataTypes.STRING(10),
      allowNull: true,
      unique: true,
    },
    phone_code: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active",
    },
  },
  {
    tableName: "countries",
    timestamps: true,
  },
);

export default Country;
