const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { Group, User, GroupImage, Membership, Event, Venue, Attendance } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { group, error } = require('console');
const { requireAuth } = require('../../utils/auth');
const { url } = require('inspector');
const e = require('express');


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
    errors.page = "Page must be less than 10";
    return next({
      message:"Bad Request",
      errors:errors,
    })
  } else if (size > 20){
    errors.size = "Size must be less than 20";
    return next({
      message:"Bad Request",
      errors:errors,
    })
  } else if (page < 1){
    errors.page = "Page must be greater than or equal to 1";
    return next({
      message:"Bad Request",
      errors:errors
    })
  } else if (size < 1){
    errors.size = "Size must be greater than or equal to 1";
    return next({
      message:"Bad Request",
      errors:errors
    })
  }


  if(name) {
      if(typeof name !== 'string') {
        errors.name = "Name must be a string";
        return next({
          message:"Bad Request",
          errors:errors,
        })
      }
  where.name = { [Op.substring]: name };
  }

  if(type){
    if(type !== "Virtual" && type !== 'In-Person'){
      errors.type = "Type must be 'Virtual' or 'In-Person'"
      return next({
        message:"Bad Request",
        errors:errors,
      })
    }

    if(type == 'Virtual'){
      where.type = 'Virtual';
    }
    else {
      where.type = 'In-Person';
    }
  }

  if(startDate){

  }

  const events = await Event.findAll({
    include: [{
      model:Venue,
      attributes:['id', 'city', 'state'],
    }],
    where:where,
    ...pagination,
  });

  let eventsList = [];

  events.forEach(event => {
    eventsList.push(event.toJSON());
  })

  eventsList.forEach(event => {
    delete event.createdAt;
    delete event.updatedAt;
  })

  return res.json({Events:eventsList});

})

//get /:eventId
router.get('/:eventId', async (req,res,next) => {
  const event = await Event.findByPk(req.params.eventId);

  if(!event){
    return next({
      message:"Event couldn't be found",
    })
  }

  const payloadEvent = event.toJSON();
  const group = await event.getGroup({where:event.groupId});
  const payloadGroup = group.toJSON();
  delete payloadGroup.organizerId;
  delete payloadGroup.createdAt;
  delete payloadGroup.updatedAt;
  const venue = await event.getVenue({where:event.venueId});
  const payloadVenue = venue.toJSON();
  delete payloadVenue.groupId;
  delete payloadVenue.createdAt;
  delete payloadVenue.updatedAt;
  const eventImages = await event.getEventImages({where:event.eventId});
  const payloadEventImages = eventImages[0].toJSON();
  delete payloadEventImages.eventId;
  delete payloadEventImages.createdAt;
  delete payloadEventImages.updatedAt;

  const payload = {
    id: payloadEvent.id,
    groupid: payloadEvent.groupid,
    venueId: payloadEvent.venueId,
    name: payloadEvent.name,
    description: payloadEvent.description,
    type: payloadEvent.type,
    capacity: payloadEvent.capacity,
    price: payloadEvent.price,
    startDate: payloadEvent.startDate,
    endDate: payloadEvent.endDate,
    Group: payloadGroup,
    Venue: payloadVenue,
    EventImages: payloadEventImages
  }

  return res.json(payload);
})


//post /:eventId/images
router.post('/:eventId/images', async (req,res,next) => {
  const event = await Event.findByPk(req.params.eventId);

  if(!event){
    return next({
      message:"Event couldn't be found",
    })
  }

  const {preview, url} = req.body;

  let newImage = await event.createEventImage({
    eventId: req.params.eventId,
    url:url,
    preview:preview
  })

  newImage = newImage.toJSON();
  delete newImage.id;
  delete newImage.eventId;
  delete newImage.createdAt;
  delete newImage.updatedAt;

  return res.json(newImage);
})

//put /:eventId
router.put('/:eventId', async (req,res,next) => {
  const event = await Event.findByPk(req.params.eventId);

  if(!event){
    return next({
      message:"Event couldn't be found",
    })
  }

  const errors = {};
  const {venueId, name, type, capacity, price, description, startDate, endDate} = req.body;

  if(venueId !== undefined){
    let checkVenue = await Venue.findByPk(venueId);
    if(!checkVenue){
      errors.venueId = "Venue does not exist";
      next({
        message:"Bad Request",
        errors:errors
      })
    }
    event.venueId = venueId;
  }

  if(name !== undefined){
    if(name.length < 5){
      errors.name = "Name must be at least 5 characters";
      next({
        message:"Bad Request",
        errors:errors
      })
    }
    event.name = name;
  }

  if(type !== undefined){
    if(type.toLowerCase() !== "virtual" && type.toLowercase() !== "in-person"){
      errors.type = "Type must be 'Virtual' or 'In-Person'"
      return next({
        message:"Bad Request",
        errors:errors,
      })
    }
    event.type = type;
  }

  if(capacity !== undefined){
    if(typeof capacity !== "Integer"){
      errors.capacity = "Capacity must be an integer";
      return next({
        message:"Bad Request",
        errors:errors
      })
    }
    event.capacity = capacity;
  }

  if(price !== undefined){
    if(price < 0){
      errors.price = "Price is invalid";
      return next({
        message:"Bad Request",
        errors:errors
      })
    }
    event.price = price;
  }

  if(description !== undefined){
    if(!description){
      errors.description = "Description is required"
      return next({
        message:"Bad Request",
        errors:errors
      })
    }
    event.description = description;
  }

  if(startDate !== undefined){
    if(startDate <= new Date()){
      errors.startDate = "Start date must be in the future";
      return next({
        message:"Bad Request",
        errors:errors
      })
    }
    event.startDate = startDate;
  }

  if(endDate !== undefined){
    if(endDate < startDate){
      errors.endDate = "End date is less than start date";
      return next({
        message:"Bad Request",
        errors:errors
      })
    }
    event.endDate = endDate;
  }

  await event.save();
  event = event.toJSON();
  return res.json(event);
})

//delete /:eventId
router.delete('/:eventId', async (req,res,next) => {
  const deleteEvent = await Event.findByPk(req.params.eventId);

  if(!deleteEvent){
    return next({
      message:"Event couldn't be found",
    })
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
  const users = await foundEvent.getUsers();
  let cohostCheck = false;
  let sendingUsers = [];

  if(!foundEvent){
    return next({message:"Event couldn't be found"});
  }

  const findMembershp = await Group.findOne({
    where:{
      id:foundEvent.groupId,
    },
    include: [{
      model:Membership,
      attributes:['status','userId'],
    }]
  })

  let nonPendingUsers = [];

  findMembershp.Memberships.forEach(member => {
    if(member.status.toLowerCase() !== 'pending'){
      nonPendingUsers.push(member.toJSON());
    }
    if(member.userId == user.id){
      if(member.status == "Co-Host"){
        cohostCheck = true;
      }
    }
  })

  if(cohostCheck){
    sendingUsers = findMembershp.Memberships;
  }
  else {
    sendingUsers = nonPendingUsers;
  }

  return res.json(sendingUsers);
})

//post /:eventId/attendance
router.post('/:eventId/attendance', async (req,res,next) =>{
  const {user} = req;
  const {userId, status} = req.body;

  const findEvent = await Event.findByPk(req.params.eventId);
  if(!findEvent){
    return next({message:"Event couldn't be found"});
  }

  const findMembershp = await Group.findOne({
    where:{
      id:findEvent.groupId,
    },
    include: [{
      model:Membership,
      attributes:['status','userId'],
      where:{
        userId: user.id,
      }
    }]
  })

  if(!findMembershp){
    return next({message:"User is not in the group"})
  }

  members = findMembershp.Memberships;

  members.forEach(member => {
    if(member.userId == user.id){
      if(member.status.toLowerCase() == 'pending'){
        return next({message:"Cannot join event user is pending for group"});
      }
    }
  })


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
      status:'Pending',
    })
  } else {
    if(findAttendace.status.toLowerCase() == 'pending'){
      return next({message:"Attendance has already been requested"})
    } else{
      return next({message:"User is already an attendee of the event"})
    }
  }

  return res.json({
    userId:newAttendance.userId,
    status:newAttendance.status,
  });
})

//put /:eventId/attendance
router.put('/:eventId/attendance', async (req,res,next) =>{
  const {userId, status} = req.body;
  const {user} = req;

  let checkEvent = await Event.findByPk(req.params.eventId);

  let userStatus = await Membership.findOne({
    where:{
      userId:user.id
    }
  })

  if(userStatus.status.toLowerCase() !== 'co-host'){
    return next({message:"Current User must already be the organizer or have a membership to the group with the status of co-host"})
  }

  let groupStatus = await Group.findOne({
    where:{
      organizerId:user.id
    }
  })

  if(!groupStatus){
    return next({message:"Current User must already be the organizer or have a membership to the group with the status of co-host"})
  }

  if(!checkEvent){
    return next({message:"Event couldn't be found"});
  }

  if(status.toLowerCase() == 'pending'){
    return next ({message:"Event couldn't be found"});
  }

  let foundAttendance = await Attendance.findOne({
    where:{
      userId:userId,
      eventId:req.params.eventId,
    }
  })

  if(!foundAttendance){
    return next({message:"Attendance between the user and the event does not exist"});
  }

  foundAttendance.status = 'Attending';
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
router.delete('/:eventId/attendance', async (req,res,next) => {
  const {user} = req;
  const {userId} = req.body;

  let findEvent = await Event.findByPk(req.params.eventId);
  let userStatus = await Membership.findOne({
    where:{
      userId:user.id
    }
  })
  if(!findEvent){
    return next({message:"Event couldn't be found"});
  }

  let findAttendace = await Attendance.findOne({
    where:{
      userId:userId,
      eventId:req.params.eventId,
    }
  })

  if(!findAttendace){
    return next({message:"Attendance does not exist for this User"})
  }

  if(user.id !== findAttendace.userId && userStatus.status !== "Host"){
    return next({message:"Only the User or organizer may delete an attendance"});
  }

  await findAttendace.destroy();

  return res.json({
    "message": "Successfully deleted attendance from event"
  }
  )
})



module.exports = router;
