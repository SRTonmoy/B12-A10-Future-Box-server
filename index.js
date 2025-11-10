// index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- MongoDB Connection ---
const uri = process.env.MONGO_URI || "mongodb+srv://assigment-ten:rGpocyaWmpBdTy5Z@cluster0.5q9kkgs.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// --- Start Server ---
app.get("/", (req, res) => {
  res.send("✅ Habit Hub Server is Running Fine");
});

// --- Async DB Run ---

    // ✅ Ping
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Connected to MongoDB Atlas successfully!");

  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
  }
}
run();

// --- Listen on Port ---
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
