import "dotenv/config";

import sequelize from "@/lib/database.js";

import "../model/user.ts";
import "../model/categories.ts";
import "../model/product.ts";
import "../model/coupon.ts";
import "../model/productdetaile.ts";

async function dbSync() {
  try {
    console.log("🔄 Connecting to database...");
    await sequelize.authenticate();
    console.log("✅ Database connected");

    await sequelize.sync({
      alter: process.env.NODE_ENV !== "production",
    });

    console.log("✅ Tables created / synced successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Database sync failed:", error);
    process.exit(1);
  }
}

dbSync();
