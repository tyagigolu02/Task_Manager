require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, Project, Task } = require("./models");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const mongoUrl = process.env.MONGO_URI || "";

mongoose
  .connect(mongoUrl)
  .then(() => {
    console.log("db connect ok");
  })
  .catch((err) => {
    console.log("db error", err?.message);
  });

function makeToken(u) {
  return jwt.sign(
    { id: u._id, role: u.role, email: u.email },
    process.env.JWT_SECRET || "secret123",
    { expiresIn: "7d" }
  );
}

async function authMid(req, res, next) {
  var tok = req.headers.authorization;
  if (!tok) return res.status(401).json({ msg: "no token" });
  try {
    let realTok = tok.replace("Bearer ", "");
    const data = jwt.verify(realTok, process.env.JWT_SECRET || "secret123");
    const usr = await User.findById(data.id).select("-password");
    if (!usr) return res.status(401).json({ msg: "user not found" });
    req.user = usr;
    next();
  } catch (e) {
    return res.status(401).json({ msg: "bad token" });
  }
}

function adminOnly(req, res, next) {
  if (req.user?.role !== "Admin") return res.status(403).json({ msg: "admin only" });
  next();
}

app.get("/", (req, res) => {
  res.json({ ok: true, msg: "Team Task Manager API" });
});

// auth area
app.post("/api/register", async (req, res) => {
  try {
    let { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ msg: "missing data" });

    const chk_usr = await User.findOne({ email });
    if (chk_usr) return res.status(400).json({ msg: "email already" });

    const hash_pass = await bcrypt.hash(password, 10);
    let newUser = await User.create({ name, email, password: hash_pass, role });

    // console.log("new user", newUser);
    return res.json({ ok: true, user: { id: newUser._id, role: newUser.role, email: newUser.email } });
  } catch (e) {
    return res.status(500).json({ msg: "register failed" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    let { email, password } = req.body;
    const userFound = await User.findOne({ email });
    if (!userFound) return res.status(400).json({ msg: "wrong login" });

    let chk_pass = await bcrypt.compare(password, userFound.password);
    if (!chk_pass) return res.status(400).json({ msg: "wrong login" });

    const token = makeToken(userFound);
    return res.json({ ok: true, token, user: { id: userFound._id, role: userFound.role, email: userFound.email, name: userFound.name } });
  } catch (err) {
    return res.status(500).json({ msg: "login failed" });
  }
});

// project routes
app.get("/api/projects", authMid, async (req, res) => {
  try {
    const list = await Project.find({}).populate("adminId", "name email");
    return res.json({ ok: true, data: list });
  } catch (e) {
    return res.status(500).json({ msg: "project list err" });
  }
});

app.post("/api/projects", authMid, adminOnly, async (req, res) => {
  try {
    let { name, description } = req.body;
    if (!name) return res.status(400).json({ msg: "name missing" });
    const projData = await Project.create({ name, description, adminId: req.user._id });
    return res.json({ ok: true, data: projData });
  } catch (e) {
    return res.status(500).json({ msg: "project create err" });
  }
});

// task routes
app.get("/api/tasks", authMid, async (req, res) => {
  try {
    let q = {};
    if (req.user.role !== "Admin") {
      q.assignedTo = req.user._id;
    }
    const tasks = await Task.find(q)
      .populate("projectId", "name")
      .populate("assignedTo", "name email");

    return res.json({ ok: true, data: tasks });
  } catch (e) {
    return res.status(500).json({ msg: "task list err" });
  }
});

app.post("/api/tasks", authMid, adminOnly, async (req, res) => {
  try {
    const { title, description, status, dueDate, projectId, assignedTo } = req.body;
    if (!title) return res.status(400).json({ msg: "title missing" });

    const temp_val = await Task.create({ title, description, status, dueDate, projectId, assignedTo });
    return res.json({ ok: true, data: temp_val });
  } catch (e) {
    return res.status(500).json({ msg: "task create err" });
  }
});

app.patch("/api/tasks/:id/status", authMid, async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    let query = { _id: id };
    if (req.user.role !== "Admin") {
      query.assignedTo = req.user._id; // member apna hi karega
    }

    const new_stat = await Task.findOneAndUpdate(query, { status }, { new: true });
    if (!new_stat) return res.status(404).json({ msg: "task not found" });

    // console.log("updated", new_stat._id);
    return res.json({ ok: true, data: new_stat });
  } catch (e) {
    return res.status(500).json({ msg: "status update err" });
  }
});

app.listen(PORT, () => {
  console.log("server on", PORT);
});
