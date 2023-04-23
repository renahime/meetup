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
    if(type.toLowerCase() !== "online" && type.toLowerCase() !== 'In person'){
      errors.type = "Type must be 'online' or 'In person'"
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
    try{
      new Date(startDate)
    }
    catch{
      return next({message:"Start date must be a valid datetime"})
    }

    where.startDate =  { [Op.substring]: startDate };
  }

  const events = await Event.findAll({
    include:
    [
      {
        model:Group,
        attributes:['id', 'name', 'city', 'state']
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
    let eventImage = await EventImage.findOne({
      where:{
        eventId:event.id,
      },
      attributes:['url']
    })

    let attendance = await Attendance.findAll({
      where:{
        eventId:event.id,
      }
    })


    event = event.toJSON();
    eventImage = eventImage.toJSON();
    eventImage = eventImage.url;
    attendance = attendance.length;

    eventsList.push({
      id:event.id,
      groupId:event.groupId,
      venueId:event.venueId,
      name:event.name,
      type:event.type,
      startDate:event.startDate,
      endDate:event.endDate,
      numAttending:attendance,
      previewImage:eventImage,
      Group:event.Group,
      Venue:event.Venue
    })

  }

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
  let payloadVenue = null;
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
  const payloadEventImages = [];
  eventImages.forEach(event =>{
    event = event.toJSON();
    payloadEventImages.push(event);
  })

  const grabAttendance = await Attendance.findAll({
    where:{
      eventId:req.params.eventId,
      status:'attending',
    }
  })

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
    numAttending: grabAttendance.length,
    Group: payloadGroup,
    Venue: payloadVenue,
    EventImages: payloadEventImages
  }

  return res.json(payload);
})


//post /:eventId/images
router.post('/:eventId/images',requireAuth, async (req,res,next) => {
  const event = await Event.findByPk(req.params.eventId);
  const {user} = req;

  if(!event){
    return next({
      message:"Event couldn't be found",
    })
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
    return next({message:"Forbidden"});
  } else if(!grabAttendance){
    return next({message:"Forbidden"});
  } else if(grabMembership.status !== 'host' && grabMembership.status !== 'co-host' && grabAttendance.status !== 'attending'){
    return next({message:"Forbidden"});
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
  const event = await Event.findByPk(req.params.eventId);
  const {user} = req;
  if(!event){
    return next({
      message:"Event couldn't be found",
    })
  }

  const grabGroup = await Group.findOne({
    where:{
      groupId:event.groupId,
    }
  })

  const grabMembership = await Membership.findOne({
    where:{
      groupId:event.groupId,
      userId:user.id,
    }
  })

  if(!grabMembership){
    return next({message:"Forbidden"})
  } else if (user.id !== grabGroup.organizerId && grabMembership.status !== 'co-host'){
    return next({message:"Forbidden"});
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
    if(type.toLowerCase() !== "virtual" && type.toLowerCase() !== "in-person"){
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
    if(new Date(startDate) <= new Date()){
      errors.startDate = "Start date must be in the future";
      return next({
        message:"Bad Request",
        errors:errors
      })
    }
    event.startDate = startDate;
  }

  if(endDate !== undefined){
    if(new Date(endDate) < new Date(startDate)){
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
router.delete('/:eventId',requireAuth, async (req,res,next) => {
  const deleteEvent = await Event.findByPk(req.params.eventId);
  const {user} = req;

  console.log(deleteEvent.groupId);

  if(!deleteEvent){
    return next({
      message:"Event couldn't be found",
    })
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
    return next({message:"Forbidden"})
  } else if (user.id !== grabGroup.organizerId && grabMembership.status !== 'co-host'){
    return next({message:"Forbidden"});
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
    return next({message:"Event couldn't be found"});
  }

  const grabMembership = await Membership.findOne({
    where:{
      userId:user.id,
      groupId: foundEvent.groupId
    }
  })
  console.log(user.id);
  console.log(foundEvent.groupId);
  console.log(grabMembership);

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
        console.log(grabMembership.status == 'host' || grabMembership.status == 'co-host')
        if (grabMembership.status == 'host' || grabMembership.status == 'co-host')
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
    return next({message:"Event couldn't be found"});
  }

  const findMembership = await Membership.findOne({
    where:{
      userId:user.id,
      groupId:findEvent.groupId
    }
  }
  )

  if(!findMembership){
    return next({message:"User is not in the group"})
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
router.put('/:eventId/attendance',requireAuth,  async (req,res,next) =>{
  const {userId, status} = req.body;
  const {user} = req;

  let checkEvent = await Event.findByPk(req.params.eventId);

  if(!checkEvent){
    return next({message:"Event couldn't be found"});
  }

  let userStatus = await Membership.findOne({
    where:{
      userId:user.id,
      groupId:checkEvent.groupId
    }
  })

  if(!userStatus){
    return next({message:"Membership does not exist"})
  }

  if(userStatus.status.toLowerCase() !== 'co-host' && userStatus.status.toLowerCase() !== 'host'){
    return next({message:"Current User must already be the organizer or have a membership to the group with the status of co-host"})
  }

  if(status.toLowerCase() == 'pending'){
    return next ({message:"Cannot change an attendance status to pending"});
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
    return next({message:"Event couldn't be found"});
  }

  let userStatus = await Membership.findOne({
    where:{
      userId:user.id,
      groupId:findEvent.groupId,
    }
  })

  //return res.json(userStatus);

  if((!userStatus) || (userStatus.status !== 'host' && userId !== user.id)){
    return next({message:"Only the User or organizer may delete an Attendance"})
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

  await findAttendace.destroy();

  return res.json({
    "message": "Successfully deleted attendance from event"
  }
  )
})



module.exports = router;
