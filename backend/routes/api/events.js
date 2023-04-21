const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { Group, User, GroupImage, Membership, Event, Venue } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { group } = require('console');
const { requireAuth } = require('../../utils/auth');
const { url } = require('inspector');
const e = require('express');


const router = express.Router();

//get /events
router.get("/", async (req,res) => {
  const events = await Event.findAll();

  let eventsList = [];

  events.forEach(event => {
    eventsList.push(event.toJSON());
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


module.exports = router;
