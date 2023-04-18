const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    ticketID: { type: String, unique: true },
    userID: String,
    eventID: String,
    paymentType: String,
    createdTime: Date,
  });

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;