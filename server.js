const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const Groq = require("groq-sdk");

const app = express();
const PORT = process.env.PORT || 3000;

/* =====================
   MIDDLEWARE
===================== */
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

/* =====================
   MYSQL CONNECTION
===================== */
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "6006", // 🔴 change this if needed
  database: "studio"
});

db.connect(err => {
  if (err) {
    console.error("❌ MySQL connection failed:", err);
  } else {
    console.log("✅ MySQL connected");
  }
});

/* =====================
   GROQ CLIENT
===================== */
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

/* =====================
   AUTH ROUTES
===================== */
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const hashed = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashed],
      err => {
        if (err) return res.status(500).json({ message: "Register failed" });
        res.json({ message: "Registration successful" });
      }
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, result) => {
      if (err) return res.status(500).json({ message: "Server error" });

      if (result.length === 0) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const user = result[0];
      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.json({
        message: "Login successful",
        user: { name: user.name, email: user.email }
      });
    }
  );
});

/* =====================
   SAVE ORDER
===================== */
app.post("/api/orders", (req, res) => {
  const {
    customer_name,
    email,
    phone,
    address,
    notes,
    total_amount,
    cart
  } = req.body;

  if (!customer_name || !email || !phone || !address || !total_amount || !cart) {
    return res.status(400).json({ message: "Invalid order data" });
  }

  db.query(
    `INSERT INTO orders 
     (customer_name, email, phone, address, notes, total_amount)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [customer_name, email, phone, address, notes || "", total_amount],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Order failed" });
      }

      const orderId = result.insertId;

      const values = cart.map(item => [
        orderId,
        item.name,
        item.price,
        item.quantity,
        item.color || ""
      ]);

      db.query(
        `INSERT INTO order_items
         (order_id, product_name, price, quantity, color)
         VALUES ?`,
        [values],
        err => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: "Order items failed" });
          }

          res.json({ message: "Order placed successfully" });
        }
      );
    }
  );
});

/* =====================
   CHATBOT ROUTE (NEW)
===================== */
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ reply: "Please type a message." });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ reply: "Missing GROQ_API_KEY in .env" });
    }

    // System instructions (your chatbot personality)
  const systemPrompt = `
You are StudioAura's official AI assistant.

ABOUT THE BUSINESS:
StudioAura is a design studio offering:
- Interior design services
- Handcrafted wooden crafts and furniture

APPROVED PRODUCT LIST (EXACT – DO NOT INVENT):

1. Elegant Wooden Shelf Unit – $130
2. Handcrafted Mirror Frame – $90
3. Wooden Bowl Set – $55
4. Classic Wooden Chair – $110
5. Vintage Wooden Clock – $95
6. Triangle Wooden Shelf – $85
7. Artisanal Wooden Table – $65
8. Minimalist Kitchen Rack – $120
9. Rustic Wooden Lamp – $75

PRODUCT RULES (STRICT):
- Only mention products listed above.
- Only mention prices exactly as listed above.
- Do NOT guess, estimate, or modify prices.
- Do NOT create bundles or discounts.
- Do NOT mention taxes, shipping, or delivery costs.
- If customization is asked, explain that pricing may change.

CUSTOMIZATION:
All products are handcrafted and customization may be available.
Customizations can affect final pricing and must be confirmed.

WHEN USERS ASK ABOUT PRICES:
- You may state the exact listed price.
- If customization is requested, say pricing may vary.

WHEN USERS ASK FOR CHEAPEST PRODUCT:
- Identify the lowest priced item from the list only.

WHEN USERS ASK FOR PRODUCTS NOT LISTED:
- Say the product is not currently listed
- Suggest a custom request or contacting StudioAura

TONE:
- Friendly
- Professional
- Honest
- Confident but never speculative
`;



    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.6,
      max_tokens: 400,
      messages: [
        { role: "system", content: systemPrompt.trim() },
        { role: "user", content: message }
      ]
    });

    const reply =
      completion.choices?.[0]?.message?.content?.trim() ||
      "Sorry, I couldn't generate a response. Try again.";

    res.json({ reply });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({
      reply: "Sorry, the chatbot is having trouble right now. Please try again."
    });
  }
});

/* =====================
   START SERVER
===================== */
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
