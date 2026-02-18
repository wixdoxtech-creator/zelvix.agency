import sequelize from "@/lib/database";
import Product from "@/model/product";
import { DataTypes } from "sequelize";

const Review = sequelize.define(
  "Review",
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
    // Product slug mapping for direct relation on slug-based routes.
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
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 0,
    },
    dis: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "reviews",
    timestamps: true,
  },
);

Review.belongsTo(Product, {
  foreignKey: "product_id",
  targetKey: "id",
  as: "productById",
});

Review.belongsTo(Product, {
  foreignKey: "product_name",
  targetKey: "slug",
  as: "productBySlug",
});

export default Review;
