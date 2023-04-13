const Users = require("../models/User");

const getUserByEmail = async (req, res) => {
  const email = req.query.email;

  try {
    const userDetails = await Users.findOne({ email: email });
    if (userDetails) {
      console.log("user..", userDetails);
      return res.status(200).json({ userDetails });
    } else {
      return res.status(401).json({ error: "User Not Found" });
    }
  } catch (err) {
    console.log("Error: ", err);
    return res.status(500).json({ error: "Server Error" });
  }
};

module.exports = {
  getUserByEmail,
};