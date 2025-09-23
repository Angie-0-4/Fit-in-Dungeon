import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const router = express.Router();


router.post("/register", async (req, res) => {
  try {
    const { username, password, gender } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password too short" });
    }

    const uname = String(username).trim().toLowerCase();

    const exists = await User.findOne({ username: uname }).lean();
    if (exists) return res.status(409).json({ message: "Username already taken" });

    const hash = await bcrypt.hash(password, 10);
    await new User({
      username: uname,
      password: hash,
      gender: gender ?? null,
    }).save();

    return res.status(201).json({ message: "Registered" });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: "Username already taken" });
    }
    console.error("REGISTER error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ message: "Missing fields" });

    const uname = String(username).trim().toLowerCase();
    const user = await User.findOne({ username: uname });
    if (!user) return res.status(404).json({ message: "User not found" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Wrong password" });

    req.session.user = {
      id: user._id.toString(),
      username: user.username,
      gender: user.gender ?? null,
    };
    return res.json({ user: req.session.user });
  } catch (err) {
    console.error("LOGIN error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});


router.get("/me", (req, res) => {
  if (!req.session?.user) return res.status(401).json({ message: "Not logged in" });
  return res.json({ user: req.session.user });
});


router.post("/logout", (req, res) => {
  req.session.destroy(() => res.json({ message: "Logged out" }));
});

router.post("/gender", async (req, res) => {
  try {
    if (!req.session?.user) return res.status(401).json({ message: "Not logged in" });
    const { gender } = req.body || {};
    if (!["sir", "lady"].includes(gender)) {
      return res.status(400).json({ message: "Invalid gender" });
    }

    const user = await User.findByIdAndUpdate(
      req.session.user.id,
      { $set: { gender } },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    req.session.user = {
      id: user._id.toString(),
      username: user.username,
      gender: user.gender ?? null,
    };
    return res.json({ user: req.session.user });
  } catch (err) {
    console.error("GENDER error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;