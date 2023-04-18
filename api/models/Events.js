const express = require("express");
const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
    event_id: { type: String, index: true},
    title: String,
    created_by: String,
    description: String,
    location: String,
    event_date: Date,
    ticket_price: Number,
    event_category: String,
    tickets_booked: Number
});

const Events = mongoose.model("Events", eventSchema);

module.exports = Events;