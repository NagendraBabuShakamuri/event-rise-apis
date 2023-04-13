const express = require("express");
const router = express.Router();

const { getUserByEmail } = require("../controllers/controller");

router.get("/userProfile", getUserByEmail);

module.exports = router;