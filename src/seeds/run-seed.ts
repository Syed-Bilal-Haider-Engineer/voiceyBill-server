import "dotenv/config";
import { connctDatabase } from "../config/database.config";
import UserModel from "../models/user.model";
import TransactionModel from "../models/transaction.model";

const shouldWipe = process.argv.includes("--wipe") || process.argv.includes("--reset");

async function seed() {
  try {
    await connctDatabase();
    console.log("Seeding database...");

    if (shouldWipe) {
      console.log("Wiping existing seed data...");
      await TransactionModel.deleteMany({});
      await UserModel.deleteMany({});
    }

    const seedUserEmail = "seed@example.com";
    const seedUserName = "Seed User";
    const seedUserPassword = "Password123!";

    let user = await UserModel.findOne({ email: seedUserEmail });
    if (!user) {
      user = new UserModel({
        name: seedUserName,
        email: seedUserEmail,
        password: seedUserPassword,
        isVerified: true,
      });
    } else {
      user.name = seedUserName;
      user.isVerified = true;
      user.password = seedUserPassword;
    }
    await user.save();

    // Create sample transactions
    const transactions = [
      {
        userId: user._id,
        type: "INCOME",
        title: "Salary",
        amount: 2500.5,
        category: "Salary",
        isRecurring: true,
        recurringInterval: "MONTHLY",
      },
      {
        userId: user._id,
        type: "EXPENSE",
        title: "Groceries",
        amount: 120.75,
        category: "Food",
        isRecurring: false,
      },
    ];

    for (const transaction of transactions) {
      await TransactionModel.updateOne(
        { userId: user._id, title: transaction.title },
        { $set: transaction },
        { upsert: true },
      );
    }

    console.log("Seeding completed.");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seed();
