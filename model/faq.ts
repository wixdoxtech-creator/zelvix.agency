import sequelize from "@/lib/database";
import Product from "@/model/product";
import { DataTypes } from "sequelize";

const FAQ = sequelize.define(
  "FAQ",
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
      references: {
        model: "products",
        key: "id",
      },
    },
    product_name: {
      type: DataTypes.STRING(191),
      allowNull: false,
      references: {
        model: "products",
        key: "slug",
      },
    },
    name: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "faqs",
    timestamps: true,
  },
);

FAQ.belongsTo(Product, {
  foreignKey: "product_id",
  targetKey: "id",
  as: "productById",
});

FAQ.belongsTo(Product, {
  foreignKey: "product_name",
  targetKey: "slug",
  as: "productBySlug",
});

export default FAQ;
