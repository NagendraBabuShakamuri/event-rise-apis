const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
    ticketID: { type: Integer, unique: true },
    user_id: Integer,
    event_id: Integer,
    payment_type: String,
    created_time: Date,
  });

const Ticket = mongoose.model('Ticket', TicketSchema);

module.exports = Ticket;