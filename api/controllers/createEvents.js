const Event = require('../models/Events');

const createEvent = async (req, res) => {
    process.stdout.write('Create event API gets called')
    console.log(req.body)
    req.body['status'] = "pending"
    try{
        await Event.create(
            req.body
        )
        res.send({"message": "event created successfully"})
    }
    catch (e){
        console.log(e)
        res.send({"message": "event creation failed"})
    }
}

module.exports = {
    createEvent
};