const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(bodyParser.json());

const router = require("./src/api/router");

mongoose.Promise = global.Promise;

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/LeaveManagementSystem', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

// Routes which should handle requests
app.use("/leavemanagementsystem/leaves", router);

module.exports = app;
