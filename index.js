const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const mysql = require("mysql");

const cors = require("cors");

const connection = require("./config/db");

const indexRouter = require("./routes/users");
const propertiesRouter = require("./routes/properties");
const reportsRouter = require("./routes/reports");
const tenantsRouter = require("./routes/tenants")

connection.connect(console.log("conectado a la db"));

app.use(express.json());
app.use(express.urlencoded());
app.use(cors());
app.use(express.static("public"));

app.use("/", indexRouter);
app.use("/properties", propertiesRouter);
app.use("/reports", reportsRouter);
app.use("/tenants", tenantsRouter);

app.listen(5000);

// tsc index.ts --esModuleInterop