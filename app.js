const express = require("express");
const bodyParser = require("body-parser");
var cors = require("cors");
const router = require("./api/routes/routes");
const services = require("./api/services/service");
const app = express();
app.use(express.json());
app.use(cors());

app.use("/user", router);

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

//Listening to client requests.
app.listen(port, function(){
  console.log("Server running on port 3000.");
});

module.exports = app;