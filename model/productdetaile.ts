import sequelize from "@/lib/database";
import { DataTypes } from "sequelize";

const ProductDetaile = sequelize.define(
  "ProductDetaile",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      unique: true,
    },
    benefits: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      // [{ img: "", heding: "", pera: "" }]
    },
    img1: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    img2: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    Ingredients: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      // [{ img: "", heding: "", pera: "" }]
    },
    Use: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      // [{ heading: "", paragraf: "", protip: [] }]
    },
  },
  {
    tableName: "product_detailes",
    timestamps: true,
  },
);

export default ProductDetaile;
