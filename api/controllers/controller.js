const User = require('../models/User');
const saltRounds = 10;
const validator = require("email-validator");
const bcrypt = require('bcrypt');

function isPasswordSame(user_pass, password){
    return new Promise((resolve, reject) => {
        bcrypt.compare(user_pass, password, function(err, same){
            if(err)
            {
                reject(console.log(err));
            }
            else
            {
                resolve(same);
            }
        });
    });
}

const getUserByEmail = async (req, res) => {
    const email = req.body.email;
    if(typeof email === "string")
    {
        let found = await User.findOne({email}, {_id: 0, __v: 0, password: 0}).catch((err) => {
            res.send(err);
        });
        if(found)
        {
            res.status(200);
            res.send(found);
        }
        else 
        {
            res.status(404);
            res.send({"Status": 404, "Message": "User not found."});
        }
    }
    else 
    {
        res.status(400);
        res.send({"Status": 400, "Message": "Request body is not valid."});
    }
};

const userExists = async (req, res) => {
    const email = req.body.email;
    let password = req.body.password;
    let count = Object.keys(req.body).length;
    if(typeof password === "password" && validator.validate(email) && count === 2)
    {
        const foundUser = await User.findOne({email: email});
        if(foundUser)
        {
        let same = await isPasswordSame(password, foundUser.password);
        if(same)
        {
                res.status(200);
                res.send({"Status": 200, "Message": "User exists."});
        }
        else
        {
                res.status(401);
                res.send({"Status": 401, "Message": "email or password is incorrect."});
        }       
        }
        else 
        {
            res.status(401);
            res.send({"Status": 401, "Message": "email or password is incorrect."});
        }
    }
    else
    {
       res.status(400);
       res.send({"Status": 400, "Message": "Request body is not valid."});
    //    logger.info(`Username is not valid or not all the mandatory fields were filled.`);
    }
}

const createUser = async (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    let password = req.body.password;
    const age = req.body.age;
    const mobile = req.body.mobile;
    const gender = req.body.gender;
    const street1 = req.body.street1;
    const street2 = req.body.street2;
    const city = req.body.city;
    const state = req.body.state;
    const zip = req.body.zip;    
    let count = Object.keys(req.body).length;
    if(typeof name === "string" && typeof password === "string" && typeof age === "number" && typeof mobile === "string" && typeof gender === "string" && typeof street1 === "string" && typeof street2 === "string" && typeof city === "string" && typeof state === "string" && typeof zip === "number" && validator.validate(email) && count === 11)
    {
        let found = await User.findOne({email: email});
        if(!found)
        {
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
                zip: zip                
            });

            await user.save().then(() => {
                res.status(201);
                res.send({"Status": 201, "Message": "Created a new user successfully."});
            }).catch((err) => {
                res.send(err);
            });
            // logger.info(`Created the user.`);
        }
        else
        {
            res.status(400);
            res.send({"Status": 400, "Message": "The given email already exists."});
            // logger.info(`User with the given username already exists.`);
        }
    }
    else
    {
       res.status(400);
       res.send({"Status": 400, "Message": "Request body is not valid."});
    //    logger.info(`Username is not valid or not all the mandatory fields were filled.`);
    }
}

const updateUser = async (req, res) => {
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
    if(typeof name === "string" && typeof age === "number" && typeof mobile === "string" && typeof gender === "string" && typeof street1 === "string" && typeof street2 === "string" && typeof city === "string" && typeof state === "string" && typeof zip === "number" && validator.validate(email) && count === 10)
    {    
        let found = await User.findOne({email: email});
        if(found)
        {            
            const update = await User.updateOne({email: email}, {
                name: name,
                age: age,
                mobile: mobile,
                gender: gender,
                street1: street1,
                street2: street2,
                city: city,
                state: state,
                zip: zip                
            });

            if (update.matchedCount > 0)
                res.sendStatus(204);
            else 
            {
                res.status(404);
                res.send({"Status": 404, "Message": "User with the given mail id does not exist."});
            }
            // logger.info(`Created the user.`);
        }
        else
        {
            res.status(400);
            res.send({"Status": 400, "Message": "The given email already exists."});
            // logger.info(`User with the given username already exists.`);
        }
    }
    else
    {
        res.status(400);
        res.send({"Status": 400, "Message": "Request body is not valid."});
    }    
}

module.exports = {
  getUserByEmail,
  createUser,
  userExists,
  updateUser
};