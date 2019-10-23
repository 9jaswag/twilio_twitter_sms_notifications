require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const webhook = require("./webhook");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const port = 3000;

app.get("/", (req, res) =>
  res.send("Welcome to Twilio Twitter SMS Notification")
);
app.get("/register_webhook", webhook.register);
app.get("/webhook", webhook.challenge);
app.post("/webhook", webhook.listen);

app.listen(port, () => console.log(`Server listening on port ${port}!`));
