const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { Group, User, GroupImage, Membership, Event, Venue, Attendance, EventImage } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { group, error } = require('console');
const { requireAuth } = require('../../utils/auth');
const { url } = require('inspector');
const e = require('express');
const event = require('../../db/models/event');
const { start } = require('repl');


const router = express.Router();

//get /events
router.get("/", async (req,res, next) => {
  const where = {};
  const pagination = {};
  let errors = {};
  let {page, size, name, type, startDate} = req.query;

  if(!page) page = 1;
  if(!size) size = 20;

  page = parseInt(page);
  size = parseInt(size);

  if((page >= 1 && size >= 1) && (size < 20 && page < 10)){
    pagination.limit = size;
    pagination.offset = size * (page - 1);
  } else if (page > 10){
    const err = new Error("Bad Request");
    err.title = "Bad Request";
    err.errors = {message: "Page must be less than 10"};
    err.status = 400
    return next(err)
  } else if (size > 20){
    const err = new Error("Bad Request");
    err.title = "Bad Request";
    err.errors = {message: "Size must be less than 20"};
    err.status = 400
    return next(err)
  } else if (page < 1){
    const err = new Error("Bad Request");
    err.title = "Bad Request";
    err.errors = {message: "Page must be greater than or equal to 1"};
    err.status = 400
    return next(err)
  } else if (size < 1){
    const err = new Error("Bad Request");
    err.title = "Bad Request";
    err.errors = {message: "Size must be greater than or equal to 1"};
    err.status = 400
    return next(err)
  }

  if(name) {
      if(!isNaN(name)) {
        const err = new Error("Bad Request");
        err.title = "Bad Request";
        err.errors = {name:"Name must be a string"};
        err.status = 400
        return next(err)
      }
      where.name = { [Op.substring]: name };
  }

  if(type){
    if(type.toLowerCase() !== "online" && type.toLowerCase() !== 'in person'){
      const err = new Error("Bad Request");
      err.title = "Bad Request";
      err.errors = {type:"Type must be 'Online' or 'In person'"};
      err.status = 400
      return next(err)
    }
    if(type.toLowerCase() == 'online'){
      where.type = 'Online';
    }
    else {
      where.type = 'In person';
    }
  }

  if(startDate){
      let date = new Date(startDate);
      if(!(date instanceof Date) || isNaN(date.valueOf())){
        const err = new Error("Bad Request");
        err.title = "Bad Request";
        err.errors = {startDate:"Start date must be a valid datetime"};
        err.status = 400
        return next(err)
      }
    where.startDate =  { [Op.eq]: date };
  }

  const events = await Event.findAll({
    include:
    [
      {
        model:Group,
        attributes:['id', 'name', 'city', 'state', 'organizerId']
      },
      {
        model:Venue,
        attributes:['id', 'city', 'state']
      }
    ],
    where:where,
    ...pagination,
  });



  let eventsList = [];

  for(let i = 0; i < events.length; i++){
    let event = events[i];
    let organizer = await User.findByPk(event.Group.organizerId);
    let eventImage = await EventImage.findOne({
      where:{
        eventId:event.id,
      },
      attributes:['url']
    })

    if(eventImage){
      eventImage = eventImage.toJSON();
      eventImage = eventImage.url;
    } else {
      eventImage = "There are no images for this event"
    }

    let attendance = await Attendance.findAll({
      where:{
        eventId:event.id,
        status:'attending',
      }
    })


    event = event.toJSON();
    attendance = attendance.length;
    eventsList.push({
      id:event.id,
      groupId:event.groupId,
      venueId:event.venueId,
      name:event.name,
      type:event.type,
      description: event.description,
      previewImage: event.previewImage,
      startDate:event.startDate,
      endDate:event.endDate,
      numAttending:attendance,
      Group:event.Group,
      Venue:event.Venue,
      Organizer:organizer,
    })
  }

  return res.json({
    Events:eventsList,
    page:page,
    size:size
  });

})

//get /:eventId
router.get('/:eventId', async (req,res,next) => {
  const event = await Event.findByPk(req.params.eventId);

  if(!event){
    const err = new Error("Event couldn't be found.");
    err.title = "Resource not found";
    err.errors = {message:"Event couldn't be found"};
    err.status = 404;
    return next(err);
  }

  const payloadEvent = event.toJSON();
  const group = await Group.findByPk(event.groupId);
  const payloadGroup = group.toJSON();
  const organizer = await User.findByPk(payloadGroup.organizerId, {
    attributes:['id', 'firstName', 'lastName']
  });
  let groupImage = await GroupImage.findAll({where:{
    groupId:event.groupId,
  }})
  payloadGroupImage = groupImage[0].url;
  let payloadOrganizer = organizer.toJSON();
  const venue = await event.getVenue({where:event.venueId});
  let payloadVenue = "There is no venue associated with this event";
  if(venue){
    payloadVenue = venue.toJSON();
    delete payloadVenue.groupId;
    delete payloadVenue.createdAt;
    delete payloadVenue.updatedAt;
  }
  const eventImages = await EventImage.findAll({
    where:{
      eventId:req.params.eventId,
    },
    attributes:['eventId', 'url', 'preview']
  });
  let payloadEventImages = [];
  if(eventImages.length !== 0){
    eventImages.forEach(event =>{
      event = event.toJSON();
      payloadEventImages.push(event);
    })
  } else
    payloadEventImages = "There are no images for this event";


  const grabAttendance = await Attendance.findAll({
    where:{
      eventId:req.params.eventId,
      status:'attending',
    }
  })

  const payload = {
    id: payloadEvent.id,
    groupId: payloadEvent.groupId,
    venueId: payloadEvent.venueId,
    name: payloadEvent.name,
    description: payloadEvent.description,
    previewImage: payloadEvent.previewImage,
    type: payloadEvent.type,
    capacity: payloadEvent.capacity,
    price: payloadEvent.price,
    startDate: payloadEvent.startDate,
    endDate: payloadEvent.endDate,
    numAttending: grabAttendance.length,
    Group: payloadGroup,
    Venue: payloadVenue,
    EventImages: payloadEventImages,
    GroupImage: payloadGroupImage,
    Organizer: payloadOrganizer,
  }

  return res.json(payload);
})


//post /:eventId/images
router.post('/:eventId/images',requireAuth, async (req,res,next) => {
  const event = await Event.findByPk(req.params.eventId);
  const {user} = req;

  if(!event){
    const err = new Error("Event couldn't be found.");
    err.title = "Resource not found";
    err.errors = {message:"Event couldn't be found"};
    err.status = 404;
    return next(err);
  }

  const grabMembership = await Membership.findOne({
    where:{
      userId:user.id,
      groupId:event.groupId
    }
  })

  const grabAttendance = await Attendance.findOne({
    where:{
      eventId: req.params.eventId,
      userId: user.id
    }
  })

  if(!grabMembership){
    const err = new Error("Forbidden");
    err.title = "Forbidden";
    err.errors = {message:"User is not authorized"};
    err.status = 403
    return next(err)
  } else if(!grabAttendance){
    const err = new Error("Forbidden");
    err.title = "Forbidden";
    err.errors = {message:"User is not authorized"};
    err.status = 403
    return next(err)
  } else if(grabMembership.status !== 'organizer' && grabMembership.status !== 'co-host' && grabAttendance.status !== 'attending'){
    const err = new Error("Forbidden");
    err.title = "Forbidden";
    err.errors = {message:"User is not authorized"};
    err.status = 403
    return next(err)
  }

  const {preview, url} = req.body;

  let newImage = await event.createEventImage({
    eventId: req.params.eventId,
    url:url,
    preview:preview
  })

  newImage = newImage.toJSON();
  delete newImage.eventId;
  delete newImage.createdAt;
  delete newImage.updatedAt;

  return res.json(newImage);
})

//put /:eventId
router.put('/:eventId',requireAuth, async (req,res,next) => {
  let event = await Event.findByPk(req.params.eventId);
  const {user} = req;
  if(!event){
    const err = new Error("Event couldn't be found.");
    err.title = "Resource not found";
    err.errors = {message:"Event couldn't be found"};
    err.status = 404;
    return next(err);
  }

  const grabGroup = await Group.findOne({
    where:{
      id:event.groupId,
    }
  })

  const grabMembership = await Membership.findOne({
    where:{
      groupId:event.groupId,
      userId:user.id,
    }
  })


  if(!grabMembership){
    const err = new Error("Forbidden");
    err.title = "Forbidden";
    err.errors = {message:"User is not authorized"};
    err.status = 403
    return next(err)}
      else if (user.id !== grabGroup.organizerId && grabMembership.status !== 'co-host'){
      const err = new Error("Forbidden");
      err.title = "Forbidden";
      err.errors = {message:"User is not authorized"};
      err.status = 403
      return next(err)
    }


  const errors = {};
  const {venueId, name, type, capacity, price, description, startDate, endDate} = req.body;

  if(venueId !== undefined){
    let checkVenue = await Venue.findByPk(venueId);
    if(!checkVenue){
      const err = new Error("Bad Request");
      err.title = "Bad Request";
      err.errors = {message:"Venue does not exist"};
      err.status = 400
      return next(err)
    }
    event.venueId = venueId;
  }

  if(name !== undefined){
    if(name.length < 5){
      const err = new Error("Bad Request");
      err.title = "Bad Request";
      err.errors = {name: "Name must be at least 5 characters"};
      err.status = 400
      return next(err)
    }
    event.name = name;
  }

  if(type !== undefined){
    if(type.toLowerCase() !== "online" && type.toLowerCase() !== "in person"){
      const err = new Error("Bad Request");
      err.title = "Bad Request";
      err.errors = {type: "Type must be 'Online' or 'In person'"};
      err.status = 400
      return next(err)
    }
    event.type = type;
  }


  if(capacity !== undefined){
    if(typeof capacity !== "number"){
      const err = new Error("Bad Request");
      err.title = "Bad Request";
      err.errors = {capacity: "Capacity must be an integer"};
      err.status = 400
      return next(err)
    }
    event.capacity = capacity;
  }

  if(price !== undefined){
    if(price < 0 || typeof price !== 'number'){
      const err = new Error("Bad Request");
      err.title = "Bad Request";
      err.errors = {price: "Price is invalid"};
      err.status = 400
      return next(err)
    }
    event.price = price;
  }

  if(description !== undefined){
    if(!description){
      const err = new Error("Bad Request");
      err.title = "Bad Request";
      err.errors = {description: "Description is required"};
      err.status = 400
      return next(err)
    } else if (description.length < 30){
      const err = new Error("Bad Request");
      err.title = "Bad Request";
      err.errors = {description: "Description must be 30 characters or more!"};
      err.status = 400
      return next(err)
    }
    event.description = description;
  }

  if(startDate !== undefined){
    if((new Date(startDate) <= new Date())){
      const err = new Error("Bad Request");
      err.title = "Bad Request";
      err.errors = {startDate: "Start date must be in the future"};
      err.status = 400
      return next(err)
    }
    event.startDate = startDate;
  }

  if(endDate !== undefined){
    if(new Date(endDate) < new Date(startDate)){
      const err = new Error("Bad Request");
      err.title = "Bad Request";
      err.errors = {endDate: "End date is less than start date"};
      err.status = 400
      return next(err)
    }
    event.endDate = endDate;
  }

  await event.save();
  event = event.toJSON();
  delete event.createdAt;
  delete event.updatedAt;
  return res.json(event);
})

//delete /:eventId
router.delete('/:eventId',requireAuth, async (req,res,next) => {
  const deleteEvent = await Event.findByPk(req.params.eventId);
  const {user} = req;

  if(!deleteEvent){
    const err = new Error("Event couldn't be found.");
    err.title = "Resource not found";
    err.errors = {message:"Event couldn't be found"};
    err.status = 404;
    return next(err);
  }

  const grabGroup = await Group.findOne({
    where:{
      id:deleteEvent.groupId,
    }
  })

  const grabMembership = await Membership.findOne({
    where:{
      groupId:deleteEvent.groupId,
      userId:user.id,
    }
  })

  if(!grabMembership){
    const err = new Error("Forbidden");
    err.title = "Forbidden";
    err.errors = {message:"User is not authorized"};
    err.status = 403
    return next(err)
  } else if (user.id !== grabGroup.organizerId && grabMembership.status !== 'co-host'){
      const err = new Error("Forbidden");
      err.title = "Forbidden";
      err.errors = {message:"User is not authorized"};
      err.status = 403
      return next(err)
  }

  await deleteEvent.destroy();

  return res.json({
  message: "Successfully deleted"
  })
})

//get /:eventId/attendees
router.get('/:eventId/attendees', async (req,res,next) => {
  const {user} = req;
  const foundEvent = await Event.findByPk(req.params.eventId);
  let attending = [];

  if(!foundEvent){
    const err = new Error("Event couldn't be found.");
    err.title = "Resource not found";
    err.errors = {message:"Event couldn't be found"};
    err.status = 404;
    return next(err);
  }

  const grabMembership = await Membership.findOne({
    where:{
      userId:user.id,
      groupId: foundEvent.groupId
    }
  })

  const grabAttendance = await Attendance.findAll({
    where:{
      eventId:req.params.eventId
    },
    include:[{
      model:User,
      attributes:['id','firstName','lastName']
    }]
  })

  grabAttendance.forEach(attendance => {
    attendance = attendance.toJSON();
    let newAttendance = {
      id:attendance.User.id,
      firstName:attendance.User.firstName,
      lastName:attendance.User.lastName,
      attendance:{
        Attendance:{
          status:attendance.status,
        }
      }
    }
    if(attendance.status == 'pending') {
      if(grabMembership){
        if (grabMembership.status == 'organizer' || grabMembership.status == 'co-host')
        attending.push(newAttendance);
      }
    } else {
      attending.push(newAttendance);
    }
  })

  return res.json({Attendees:attending});
})

//post /:eventId/attendance
router.post('/:eventId/attendance', requireAuth,async (req,res,next) =>{
  const {user} = req;
  const {userId, status} = req.body;

  const findEvent = await Event.findByPk(req.params.eventId);
  if(!findEvent){
    const err = new Error("Event couldn't be found.");
    err.title = "Resource not found";
    err.errors = {message:"Event couldn't be found"};
    err.status = 404;
    return next(err);
  }

  const findMembership = await Membership.findOne({
    where:{
      userId:userId,
      groupId:findEvent.groupId
    }
  }
  )

  if(userId !== user.id){
    const err = new Error("Bad Request");
    err.title = "Bad Request";
    err.errors = {message:"Only current user can request to attend event"};
    err.status = 400
    return next(err)
  }

  if(!findMembership || findMembership.status == "pending"){
    const err = new Error("Bad Request");
    err.title = "Bad Request";
    err.errors = {message:"User is not in the group"};
    err.status = 400
    return next(err)
  }

  let findAttendace = await Attendance.findOne({
    where:{
      userId:user.id,
      eventId:req.params.eventId,
    }
  })

  let newAttendance;

  if(!findAttendace){
      newAttendance = await Attendance.create({
      eventId:req.params.eventId,
      userId:user.id,
      status:'pending',
    })
  } else {
    if(findAttendace.status.toLowerCase() == 'pending'){
      const err = new Error("Bad Request");
      err.title = "Bad Request";
      err.errors = {message:"Attendance has already been requested"};
      err.status = 400
      return next(err)
    } else{
      const err = new Error("Bad Request");
      err.title = "Bad Request";
      err.errors = {message:"User is already an attendee of the event"};
      err.status = 400
      return next(err)
    }
  }

  return res.json({
    userId:newAttendance.userId,
    status:newAttendance.status,
  });
})

//put /:eventId/attendance
router.put('/:eventId/attendance',requireAuth,  async (req,res,next) =>{
  const {userId, status} = req.body;
  const {user} = req;

  let checkEvent = await Event.findByPk(req.params.eventId);

  if(!checkEvent){
    const err = new Error("Event couldn't be found.");
    err.title = "Resource not found";
    err.errors = {message:"Event couldn't be found"};
    err.status = 404;
    return next(err);
  }

  let userStatus = await Membership.findOne({
    where:{
      userId:user.id,
      groupId:checkEvent.groupId
    }
  })

  if(!userStatus){
    const err = new Error("Event couldn't be found.");
    err.title = "Resource not found";
    err.errors = {message:"Membership does not exist"};
    err.status = 400
    return next(err);
  }

  if(userStatus.status.toLowerCase() !== 'co-host' && userStatus.status.toLowerCase() !== 'organizer'){
    const err = new Error("Forbidden");
    err.title = "Forbidden";
    err.errors = {message:"Current User must already be the organizer or have a membership to the group with the status of co-host"};
    err.status = 400
    return next(err)
  }

  if(status.toLowerCase() == 'pending'){
    const err = new Error("Bad Request");
    err.title = "Bad Request";
    err.errors = {message:"Cannot change an attendance status to pending"};
    err.status = 400
    return next (err);
  }

  let foundAttendance = await Attendance.findOne({
    where:{
      userId:userId,
      eventId:req.params.eventId,
    }
  })

  if(!foundAttendance){
    const err = new Error("Event couldn't be found.");
    err.title = "Resource not found";
    err.errors = {message:"Attendance between the user and the event does not exist"};
    err.status = 404;
    return next(err);
  }

  foundAttendance.status = 'attending';
  await foundAttendance.save();
  foundAttendance = foundAttendance.toJSON();

  return res.json({
    id: foundAttendance.id,
    eventId:foundAttendance.eventId,
    userId:foundAttendance.userId,
    status:foundAttendance.status
  });
})

//delete /:eventId/attendance
router.delete('/:eventId/attendance', requireAuth, async (req,res,next) => {
  const {user} = req;
  const {userId} = req.body;

  let findEvent = await Event.findByPk(req.params.eventId);

  if(!findEvent){
    const err = new Error("Event couldn't be found.");
    err.title = "Resource not found";
    err.errors = {message:"Event couldn't be found"};
    err.status = 404;
    return next(err);
  }

  let userStatus = await Membership.findOne({
    where:{
      userId:user.id,
      groupId:findEvent.groupId,
    }
  })

  //return res.json(userStatus);

  if((!userStatus) || (userStatus.status !== 'organizer' && userId !== user.id)){
    const err = new Error("Forbidden");
    err.title = "Forbidden";
    err.errors = {message:"Only the User or organizer may delete an Attendance"};
    err.status = 403
    return next(err)
  }

  let findAttendace = await Attendance.findOne({
    where:{
      userId:userId,
      eventId:req.params.eventId,
    }
  })

  if(!findAttendace){
    const err = new Error("Event couldn't be found.");
    err.title = "Resource not found";
    err.errors = {message:"Attendance does not exist for this User"};
    err.status = 404;
    return next(err);
  }

  await findAttendace.destroy();

  return res.json({
    "message": "Successfully deleted attendance from event"
  }
  )
})



module.exports = router;
