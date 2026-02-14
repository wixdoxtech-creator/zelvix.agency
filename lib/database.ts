import "dotenv/config";
import { Sequelize } from "sequelize";
import mysql2 from "mysql2";

const sequelize = new Sequelize(process.env.DATABASE_URL!, {
  dialect: "mysql",
  dialectModule: mysql2,
  logging: false,
});

export default sequelize;
