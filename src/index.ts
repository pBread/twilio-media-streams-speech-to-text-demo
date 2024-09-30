import dotenv from "dotenv-flow";
import express from "express";
import ExpressWs from "express-ws";

dotenv.config();

const { app } = ExpressWs(express());
app.use(express.urlencoded({ extended: true })).use(express.json());

/****************************************************
 Webhooks
****************************************************/
app.post("/incoming-call", async (req, res) => {
  console.log("incoming-call");
});

/****************************************************
 Start Server
****************************************************/
const port = process.env.PORT || "3000";
app.listen(port, () => {
  console.log(`server running on http://localhost:${port}`);
});
