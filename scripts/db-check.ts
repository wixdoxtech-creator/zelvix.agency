import sequelize from "@/lib/database";
import "dotenv/config";


async function dbCheck() {
  try {
    console.log("🔍 Checking database connection...");
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
}

dbCheck();
