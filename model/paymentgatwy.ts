import sequelize from "@/lib/database";
import { DataTypes } from "sequelize";

const PaymentGateway = sequelize.define(
  "PaymentGateway",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    app_id: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    secret_key: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "payment_gateways",
    timestamps: true,
  },
);

export default PaymentGateway;
