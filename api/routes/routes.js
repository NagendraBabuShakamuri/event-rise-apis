const express = require("express");
const router = express.Router();
const { userExists, getUserByEmail, createUser, updateUser } = require("../controllers/controller");

router.get("/userProfile", getUserByEmail);

router.post("/createUser", createUser);

router.get("/login", userExists);

router.put("/update", updateUser);

module.exports = router;