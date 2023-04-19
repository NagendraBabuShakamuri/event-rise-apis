const passport = require("passport");
const express = require("express");
const router = express.Router();

const { 
    userExists, 
    getUserByEmail, 
    createUser, 
    updateUser, 
    canRenderEvent, 
    uploadProfileImage, 
    deleteProfileImage,
    paymentConfig, 
    createPaymentIntent, 
    saveTickets, 
    getTickets 
} = require("../controllers/controller");
const { createEvent } = require("../controllers/createEvents.js");

router.get("/health", (req, res) => {res.send("Hello world");})

router.get("/userProfile", getUserByEmail);

router.post("/createUser", createUser);

router.get("/login", userExists);

router.put("/update", updateUser);

router.get("/events", canRenderEvent);

router.get("/auth/google", passport.authenticate('google', { scope: ["profile", "email"] }));

router.get("/config", paymentConfig);

router.post("/create-payment-intent", createPaymentIntent);

router.post('/api/tickets', saveTickets);

router.get('/api/tickets', getTickets);

router.get("/auth/google/events", passport.authenticate('google', { failureRedirect: "/health?error=authentication_failed"}),
function(req, res) {
  // Successful authentication, redirect to the page.
    console.log(req.isAuthenticated());
    res.redirect("/events");
});

router.get("/logout", function(req, res) {
    req.logout(function(err) {
        if (err) { return next(err); }
        console.log(req.isAuthenticated());
        res.redirect('/health');
      });
});

router.post("/uploadProfileImage", uploadProfileImage);

router.post("/createEvent", createEvent);

router.delete("/deleteProfileImage", deleteProfileImage);

module.exports = router;