const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
    user_id: String,
    event_id: String,
    payment_type: String,
    created_time: Date,
  });

const Ticket = mongoose.model('Ticket', TicketSchema);

module.exports = Ticket;