import "dotenv/config";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";

const app = express();
const PORT = process.env.PORT || 5000;

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  rollNo: { type: String, required: true },
  dateOfBirth: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  department: { type: String, required: true },
  gender: { type: String, required: true },
  year: { type: String, required: true },
  section: { type: String, required: true },
  arrears: { type: Number, required: true },
  companies: { type: [String], default: [] },
}, { timestamps: true });

const Student = mongoose.model("Student", studentSchema);

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "Server is running" });
});

app.get("/api/students", async (_req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Could not load registrations" });
  }
});

app.post("/api/students", async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ message: "Could not save registration", error: error.message });
  }
});

mongoose.connect(process.env.MONGO_URI, { dbName: process.env.MONGO_DB_NAME || "student_registration" })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });