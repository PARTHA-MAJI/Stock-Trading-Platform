require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Models
const User = require("./model/UserModel");
const { HoldingsModel } = require("./model/HoldingsModel");
const { PositionsModel } = require("./model/PositionsModel");
const { OrdersModel } = require("./model/OrdersModel");

const PORT = process.env.PORT || 3002;
const uri = process.env.MONGO_URL;

const app = express();

// CORS
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      process.env.FRONTEND_URL,
      process.env.DASHBOARD_URL,
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }),
);

app.use(bodyParser.json());
app.use(cookieParser());

// AUTH: SIGNUP
app.post("/signup", async (req, res) => {
  try {
    const { email, password, username } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ message: "User already exists" });
    }
    const user = await User.create({ email, password, username });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });
  //  res.cookie("token", token, {
  //    httpOnly: false,
  //    secure: true,
  //    sameSite: "none",
  //  });
    res.status(201).json({ message: "Signed in successfully", success: true, token: token });
  } catch (error) {
    console.error(error);
  }
});

// AUTH: LOGIN
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "Incorrect email or password" });
    }
    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return res.json({ message: "Incorrect email or password" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });
  //  res.cookie("token", token, {
  //    httpOnly: false,
  //    secure: true,
  //    sameSite: "none",
  //  });
    res.status(201).json({ message: "User logged in", success: true, token: token });
  } catch (error) {
    console.error(error);
  }
});

// AUTH: LOGOUT
app.post("/logout", (req, res) => {
 // res.cookie("token", "", {
 //   httpOnly: false,
 //   secure: true,
 //   sameSite: "none",
 //   expires: new Date(0),
 // });

  res
    .status(200)
    .json({ message: "User logged out successfully", success: true });
});

// VERIFY USER (For Dashboard Protection)
app.post("/", (req, res) => {
  const token = req.body.token;
  if (!token) {
    return res.json({ status: false });
  }
  jwt.verify(token, process.env.JWT_SECRET, async (err, data) => {
    if (err) {
      return res.json({ status: false });
    } else {
      const user = await User.findById(data.id);
      if (user)
        return res.json({
          status: true,
          user: user.username,
          email: user.email,
        });
      else return res.json({ status: false });
    }
  });
});

// DATA ROUTES
app.get("/allHoldings", async (req, res) => {
  let allHoldings = await HoldingsModel.find({});
  res.json(allHoldings);
});

app.get("/allPositions", async (req, res) => {
  let allPositions = await PositionsModel.find({});
  res.json(allPositions);
});

app.post("/newOrder", async (req, res) => {
  const { name, qty, price, mode } = req.body;
  const newOrder = new OrdersModel({
    name: name,
    qty: qty,
    price: price,
    mode: mode,
  });
  await newOrder.save();

  let existingHolding = await HoldingsModel.findOne({ name: name });

  if (mode === "BUY") {
    if (existingHolding) {
      existingHolding.qty = parseInt(existingHolding.qty) + parseInt(qty);
      await existingHolding.save();
      res.send("Buy Order placed. Quantity updated!");
    } else {
      const newHolding = new HoldingsModel({
        name: name,
        qty: qty,
        price: price,
        avg: price,
        net: "+0%",
        day: "+0%",
      });
      await newHolding.save();
      res.send("Buy Order placed. New Holding created!");
    }
  } else if (mode === "SELL") {
    if (existingHolding) {
      const sellQty = parseInt(qty);
      const currentQty = parseInt(existingHolding.qty);
      if (currentQty > sellQty) {
        existingHolding.qty = currentQty - sellQty;
        await existingHolding.save();
        res.send("Sell Order placed. Quantity reduced!");
      } else if (currentQty === sellQty) {
        await HoldingsModel.deleteOne({ name: name });
        res.send("Sell Order placed. Holding sold out!");
      } else {
        res
          .status(400)
          .send("Error: You are trying to sell more than you own!");
      }
    } else {
      res.status(404).send("Error: You don't own this stock!");
    }
  } else {
    res.send("Order saved (No holding update)");
  }
});

// START SERVER
app.listen(PORT, () => {
  console.log("App started on port " + PORT);
  mongoose.connect(uri);
  console.log("DB Connected");
});
