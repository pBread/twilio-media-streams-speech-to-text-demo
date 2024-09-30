import dotenv from "dotenv";
import express from "express";
import ExpressWs from "express-ws";

dotenv.config();

const { app } = ExpressWs(express());
app.use(express.urlencoded({ extended: true })).use(express.json());

const port = process.env.PORT || "3000";
app.listen(port, () => {
  console.log(`server running on http://localhost:${port}`);
});
