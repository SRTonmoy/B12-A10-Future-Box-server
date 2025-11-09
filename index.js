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
async function run() {
  try {
    const db = client.db("assignmentTen_db");
    const habitsCollection = db.collection("habits");

    // ✅ Get All Public Habits
    app.get("/habits/public", async (req, res) => {
      const cursor = habitsCollection.find({ isPublic: true }).sort({ createdAt: -1 });
      const result = await cursor.toArray();
      res.send(result);
    });

    // ✅ Get User's Own Habits
    app.get("/habits/my/:email", async (req, res) => {
      const email = req.params.email;
      const cursor = habitsCollection.find({ userEmail: email });
      const result = await cursor.toArray();
      res.send(result);
    });

    // ✅ Add New Habit
    app.post("/habits", async (req, res) => {
      const habit = req.body;
      habit.createdAt = new Date();
      habit.updatedAt = new Date();
      habit.currentStreak = 0;
      habit.completionHistory = [];
      const result = await habitsCollection.insertOne(habit);
      res.send(result);
    });

    // ✅ Update Habit
    app.put("/habits/:id", async (req, res) => {
      const id = req.params.id;
      const updated = req.body;
      updated.updatedAt = new Date();
      const result = await habitsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updated }
      );
      res.send(result);
    });

    // ✅ Delete Habit
    app.delete("/habits/:id", async (req, res) => {
      const id = req.params.id;
      const result = await habitsCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // ✅ Mark Habit as Complete (Push Date + Update Streak)
    app.patch("/habits/complete/:id", async (req, res) => {
      const id = req.params.id;
      const today = new Date().toDateString();

      const habit = await habitsCollection.findOne({ _id: new ObjectId(id) });
      const alreadyDoneToday = habit.completionHistory?.some(
        (d) => new Date(d).toDateString() === today
      );

      if (alreadyDoneToday) {
        return res.status(400).send({ message: "Already marked complete today!" });
      }

      const updatedHistory = [...(habit.completionHistory || []), new Date()];
      const streak = calculateStreak(updatedHistory);

      const result = await habitsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { completionHistory: updatedHistory, currentStreak: streak } }
      );

      res.send(result);
    });

    // --- Helper: Calculate Current Streak ---
    function calculateStreak(history) {
      const sorted = history.sort((a, b) => new Date(b) - new Date(a));
      let streak = 0;
      let prev = new Date();

      for (const date of sorted) {
        const diff = Math.floor((prev - new Date(date)) / (1000 * 60 * 60 * 24));
        if (diff <= 1) {
          streak++;
          prev = new Date(date);
        } else break;
      }

      return streak;
    }

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
