const User = require("../models/User");
const Image = require("../models/ProfileImage");
const saltRounds = 10;
const validator = require("email-validator");
const bcrypt = require("bcrypt");
const AWS = require("aws-sdk");
const uuid = require("uuid");
const Ticket = require("../models/TicketSchema");
const { events } = require("../models/TicketSchema");
const nodemailer = require("nodemailer");
const Events = require('../models/Events');
const mongoose = require('mongoose');
const qr = require('qr-image');
require("dotenv").config({ path: "./.env" });

function isPasswordSame(user_pass, password) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(user_pass, password, function (err, same) {
      if (err) {
        reject(console.log(err));
      } else {
        resolve(same);
      }
    });
  });
}

const getUserByEmail = async (req, res) => {
  console.log("req", req.query);
  const email = req.query.email;
  if (typeof email === "string") {
    let found = await User.findOne(
      { email },
      { _id: 0, __v: 0, password: 0 }
    ).catch((err) => {
      res.send(err);
    });
    if (found) {
      res.status(200);
      res.send(found);
    } else {
      res.status(404);
      res.send({ Status: 404, Message: "User not found." });
    }
  } else {
    res.status(400);
    res.send({ Status: 400, Message: "Request body is not valid." });
  }
};

const userExists = async (req, res) => {
  const email = req.body.email;
  let password = req.body.password;
  if (email != undefined && password != undefined) {
    const foundUser = await User.findOne({ email: email });
    console.log("user", foundUser);
    if (foundUser) {
      let same = await isPasswordSame(password, foundUser.password);

      if (same) {
        res.status(200);
        res.send({
          Status: 200,
          Message: "User exists.",
          name: foundUser.name,
          email: foundUser.email,
          userId: foundUser._id,
        });
      } else {
        res.status(401);
        res.send({ Status: 401, Message: "email or password is incorrect." });
      }
    } else {
      res.status(401);
      res.send({ Status: 401, Message: "email or password is incorrect." });
    }
  } else {
    res.status(400);
    res.send({ Status: 400, Message: "Request body is not valid." });
    //    logger.info(`Username is not valid or not all the mandatory fields were filled.`);
  }
};

const createUser = async (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  let password = req.body.password;
  const age = req.body.age;
  const mobile = req.body.phoneNumber;
  const gender = req.body.gender;
  const street1 = req.body.street1;
  const street2 = req.body.street2;
  const city = req.body.city;
  const state = req.body.state;
  const zip = req.body.zip;
  const country = req.body.country;

  let count = Object.keys(req.body).length;
  if (count === 12) {
    let found = await User.findOne({ email: email });
    if (!found) {
      password = await bcrypt.hash(password, saltRounds);
      const user = new User({
        name: name,
        email: email,
        password: password,
        age: age,
        mobile: mobile,
        gender: gender,
        street1: street1,
        street2: street2,
        city: city,
        state: state,
        zip: zip,
        country: country,
      });

      await user
        .save()
        .then(() => {
          res.status(201);
          res.send({
            Status: 201,
            Message: "Created a new user successfully.",
          });
        })
        .catch((err) => {
          res.send(err);
        });
      // logger.info(`Created the user.`);
    } else {
      res.status(400);
      res.send({ Status: 400, Message: "The given email already exists." });
      // logger.info(`User with the given username already exists.`);
    }
  } else {
    res.status(400);
    res.send({ Status: 400, Message: "Request body is not valid." });
    //    logger.info(`Username is not valid or not all the mandatory fields were filled.`);
  }
};

const updateUser = async (req, res) => {
  console.log("I'm entering", req.body);
  const name = req.body.name;
  const email = req.body.email;
  const age = req.body.age;
  const mobile = req.body.mobile;
  const gender = req.body.gender;
  const street1 = req.body.street1;
  const street2 = req.body.street2;
  const city = req.body.city;
  const state = req.body.state;
  const zip = req.body.zip;
  let count = Object.keys(req.body).length;
  if (req.body && validator.validate(email)) {
    let found = await User.findOne({ email: email });
    if (found) {
      const update = await User.updateOne(
        { email: email },
        {
          name: name,
          age: age,
          mobile: mobile,
          gender: gender,
          street1: street1,
          street2: street2,
          city: city,
          state: state,
          zip: zip,
        }
      );

      if (update.matchedCount > 0) {
        let updatedUser = await User.findOne({ email: email });
        res.send({ status: 201, Message: "updated Successfully", updatedUser });
      } else {
        res.status(404);
        res.send({
          Status: 404,
          Message: "User with the given mail id does not exist.",
        });
      }
      // logger.info(`Created the user.`);
    } else {
      res.status(400);
      res.send({ Status: 400, Message: "The given email already exists." });
      // logger.info(`User with the given username already exists.`);
    }
  } else {
    res.status(400);
    res.send({ Status: 400, Message: "Request body is not valid." });
  }
};

const canRenderEvent = (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200);
    res.send({ Message: "worked" });
  } else {
    res.sendStatus(401);
  }
};

function uploadImage(image) {
  return new Promise(async (resolve, reject) => {
    AWS.config.update({
      region: process.env.AWS_DEFAULT_REGION,
    });
    const s3 = new AWS.S3();
    const fileContent = Buffer.from(image.data, "binary");
    const params = {
      Bucket: process.env.S3_BUCKET,
      Key: uuid.v4() + "/" + image.name,
      Body: fileContent,
    };
    s3.upload(params, (err, data) => {
      if (err) {
        logger.error(`${err}`);
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

const uploadProfileImage = async (req, res) => {
  const email = req.body.email;
  let isObject = function (a) {
    return !!a && a.constructor === Object;
  };
  if (isObject(req.files.image)) {
    if (
      req.files.image.mimetype !== "image/jpeg" &&
      req.files.image.mimetype !== "image/jpg" &&
      req.files.image.mimetype === "image/png"
    ) {
      res.status(400);
      res.send({
        Status: 400,
        Message: "Only the file formats JPG, JPEG and PNG are allowed.",
      });
      return;
    } else {
      let data = await uploadImage(req.files.image);
      const user = await User.findOne({ email: email });
      const image = new Image({
        user_id: user._id,
        file_name: req.files.image.name,
        s3_bucket_path: data.key,
      });
      await image
        .save()
        .then(() => {
          res.status(201);
          res.send({
            Status: 201,
            Message: "Uploaded the profile pic successfully.",
          });
        })
        .catch((err) => {
          reject(console.error("Failed to create a new Image : ", err));
        });
    }
  } else {
    res.status(400);
    res.send({ Status: 400, Message: "Only one image can be uploaded." });
    return;
  }
};

function deleteImage(key) {
  return new Promise(async (resolve, reject) => {
    AWS.config.update({
      region: process.env.AWS_DEFAULT_REGION,
    });
    var s3 = new AWS.S3();
    var params = { Bucket: process.env.S3_BUCKET, Key: key };

    s3.deleteObject(params, function (err, data) {
      if (err) {
        reject(err);
      } else resolve();
    });
  });
}

const deleteProfileImage = async (req, res) => {
  const email = req.body.email;
  const user = await User.findOne({ email: email });
  const image = await Image.findOne({ _id: user._id });
  await deleteImage(image.s3_bucket_path);
  res.sendStatus(204);
};

/* Ticket Components Start */
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-08-01",
});

const paymentConfig = (req, res) => {
  res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
};

const createPaymentIntent = async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      currency: "USD",
      amount: req.body.amount * 100,
      automatic_payment_methods: { enabled: true },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (e) {
    return res.status(400).send({
      error: {
        message: e.message,
      },
    });
  }
};

const saveTickets = async (req, res) => {
  const ticketData = req.body;
  const newTicket = new Ticket(ticketData);

  try {
    await newTicket.save();
    res.status(201).json(newTicket);
  } catch (error) {
    res.status(500).json({ message: "Error creating ticket", error });
  }
};

const getTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find();
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tickets", error });
  }
};
/* Ticket Components End */

const getUpcomingEvents = async (req, res) => {
  try {
    const currentDate = new Date();
    const nextFiveDaysDate = new Date(
      currentDate.getTime() + 5 * 24 * 60 * 60 * 1000
    );

    const upcomingEvents = await Events.find({
      event_date: { $gte: currentDate, $lte: nextFiveDaysDate },
    });
    if (upcomingEvents.length === 0) {
      return res
        .status(204)
        .json({ message: "No Upcoming events in the next 5 days" });
    } else {
      return res.status(200).json(upcomingEvents);
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error fetching upcoming event details", error });
  }
};

/* Upcoming Event section ends */

const getEventDetailsByEventId = async(req,res) => {

    try {
        const eventId =req.params.eventId;
        const eventDetails = await Events.findOne({ event_id: eventId });

    if (!eventDetails) {
      return res.status(404).send("Event not found");
    }
    res.status(200).json(eventDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error fetching event details for the given eventID",
      error,
    });
  }
};

/* end of get eventDetails from eventId */

const sendEmailToUser = async(req,res) => {

    //as of now ticketID params  defined below we are passing user_id value present in Ticket database

    const ticketID =req.body.ticketID;
    console.log(ticketID);

    try{
        const ticket = await Ticket.findOne({ user_id : ticketID });
        if(!ticket){
            return res.status(404).send("ticket not found with the given ticket id");
        }
        const event =await Events.findOne({event_id : ticket.eventID});
        if(!event){
            return res.status(404).send("Event not Found with the given ticket id");
        }
        const user= await User.findOne({user_id : ticket.userID});
        if(!user){
            return res.status(404).send("user not found");
        }

    const email = user.email;

    if (!email) {
      return res.status(404).send("email address not found in User database");
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "dineshitendulkar@gmail.com",
        pass: "uuqqtmmuiqohdeyq",
      },
    });

    const qrCode = qr.imageSync(`Ticket ID: ${ticket.ticketID}`, { type: 'png' });
    const attachments = [
      {
        filename: 'qr_code.png',
        content: qrCode,
        cid: 'qr_code_cid'
      }
    ];

    const mailOptions = {
    from: "dineshitendulkar@gmail.com",
    to: email,
    subject: "Ticket Details",
    html: `<p>Hi ${user.name},</p><p>Your ticket for the event ${event.title} is confirmed.</p><p>Details:</p><p>Ticket ID: ${ticket._id}</p><p>Event Title: ${event.title}</p><p>Event Date: ${event.event_date.toDateString()}</p><p>Location: ${event.location}</p><p>Payment Type: ${ticket.paymentType}</p><img src="cid:qr_code_cid" alt="QR Code"/>`,
      attachments: attachments,
      };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: "Error sending email", error });
      }
      console.log("Email sent:", info.response);
      res.status(200).json({ message: "Email sent" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching ticket details", error });
  }
};
/*end of send tickets to user*/

const getDetailsByEventCategory =async(req, res) => {
    try{
        const category =req.params.category;
        const events = await Events.find(
            { event_category: category , status: 'approved' },
            { event_id : 1,title: 1, description: 1, location: 1, event_date: 1, status: 1, image_path: 1,  _id: 0 }
          );
        console.log(events);
        if(events.length  === 0){
            return res.status(404).send("Event not found with given event_category or with approved status");
        }
        res.status(200).json(events);
    } catch(error){
        console.error(error);
    res.status(500).json({ message: 'Error fetching events', error });
    }
}
/* end of get event details by Event Category */

const getAttendedEvents = async(req,res) => {
    try{
        const userId=req.params.userId;
       const tickets = await Ticket.find({ user_id:  userId }).sort({ created_time: -1 }).limit(5);
       const eventIds= tickets.map((ticket) => ticket.event_id);
       const events= await Events.find({ event_id: { $in: eventIds } });

       // Create an array of event objects with only the desired fields
    const eventList = events.map((event) => {
        return {
          event_id: event.event_id,
          title: event.title,
          description: event.description,
          location: event.location,
          event_date: event.event_date,
          image_path: event.image_path,
          status: event.status,
        };
      });
      res.status(200).json(eventList);
    }catch (err) {
        console.error(err);
        res.status(500).json({message : 'Error fetching attended event details', err});
      }
}

/*end of get Attended events*/

const getUpcomingEventsByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(userId);

    const userTickets = await Ticket.find({user_id : userId});
    console.log(userTickets);

    const eventIds = userTickets.map((ticket) => ticket.event_id);
    console.log(eventIds);

    const currentDate = new Date();
    const nextFiveDaysDate = new Date(currentDate.getTime() + 5 * 24 * 60 * 60 * 1000);

    const upcomingEvents = await Events.find({
      event_id: { $in: eventIds },
      event_date: { $gte: currentDate, $lte: nextFiveDaysDate },
    })
      .sort({ event_date: 1 })
      .limit(5);

    const eventList = upcomingEvents.map((event) => ({
      event_id: event.event_id,
      title: event.title,
      description: event.description,
      location: event.location,
      event_date: event.event_date,
      image_path: event.image_path,
      status: event.status,
    }));

    res.status(200).json(eventList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching upcoming event details', err });
  }
};

/* end of upcomingeventsbyuserid */

const sendEmailToEventCreator = async(req,res) => {
    
    try {
        const eventId= req.params.eventId;
        const events = await Events.findOne({ event_id: eventId });
        const user = await User.findOne({ user_id: events.hosted_by });
        const email = user.email;

        if (!email) {
            return res.status(404).send("email address not found in User database");
          }
      
          const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
              user: "dineshitendulkar@gmail.com",
              pass: "uuqqtmmuiqohdeyq",
            },
          });
          const mailOptions = {
            from: "dineshitendulkar@gmail.com",
            to: email,
            subject: "Event Details",
            html: `<p>Hi ${user.name},</p><p>Your Event  ${events.title} is Approved.</p><p>Details:</p><p>Event ID: ${events.event_id}<p>Event Date: ${events.event_date.toDateString()}</p><p>Location: ${events.location}</p>`
              };
        
            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                console.error(error);
                return res.status(500).json({ message: "Error sending email", error });
              }
              console.log("Email sent:", info.response);
              res.status(200).json({ message: "Email sent" });
            });
    } catch (err){
        console.error(error);
        res.status(500).json({ message: "Error fetching ticket details", error });
    }
}





module.exports = {
  getUserByEmail,
  createUser,
  userExists,
  updateUser,
  canRenderEvent,
  uploadProfileImage,
  deleteProfileImage,
  paymentConfig,
  createPaymentIntent,
  saveTickets,
  getTickets,
  getUpcomingEvents,
  getEventDetailsByEventId,
  sendEmailToUser,
  getDetailsByEventCategory,
  getAttendedEvents,
  getUpcomingEventsByUserId,
  sendEmailToEventCreator
};
