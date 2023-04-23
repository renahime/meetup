const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { Group, User, GroupImage, Membership, Event, Venue, Attendance, EventImage} = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { group, error } = require('console');
const { requireAuth } = require('../../utils/auth');
const { url } = require('inspector');
const e = require('express');
const { resolveSoa } = require('dns');
const { stat } = require('fs');
const { isErrored } = require('stream');


const router = express.Router();


//get api/groups
router.get('', async (req,res) => {
    const groups = await Group.findAll({
      include:[{
        model:GroupImage,
        attributes:['url']
      }]
    });

    let groupsList = [];

    for(let i = 0; i < groups.length; i++){
      let amount = await Membership.findAll({
        where:{
          groupId:groups[i].id,
        }
      })

      let previewImage = groups[i].GroupImages[0];
      previewImage = previewImage.toJSON();
      previewImage = previewImage.url;
      let group = groups[i].toJSON();
      delete group.GroupImages;
      group.numMembers = amount.length;
      group.previewImage = previewImage;

      groupsList.push(group);
    }

    return res.json({Groups:groupsList});
})

//get /api/groups/current
router.get('/current', requireAuth, async (req, res) => {
  const {user} = req;
  const grabMembership = await Membership.findAll({
    where:{
      userId:user.id
    }
  })

  const groupArr = [];

  for(let i = 0; i < grabMembership.length; i++){
    let group = await Group.findByPk(grabMembership[i].groupId, {
      include:[{
        model:GroupImage,
        attributes:['url'],
      }]
    })

    let amount = await Membership.findAll({
      where:{
        groupId:group.id,
      }
    })
    let previewImage = null;
    console.log(group.GroupImages);
    if(group.GroupImages.length !== 0){
    previewImage = group.GroupImages[0].url;
    }
    group = group.toJSON();
    delete group.GroupImages;
    group.numMembers = amount.length
    group.previewImage = previewImage;

    groupArr.push(group);
  }

  return res.json({Groups:groupArr});
})


//get api/groups/:groupId
router.get('/:groupId', async(req,res, next) => {
  const groupId = await Group.findByPk(req.params.groupId);

  if(!groupId){
  res.status(404);
  return next({
    message:"Group couldn't be found",
  });
  }

  const payloadGroupId = groupId.toJSON();
  const Organizer = await User.findByPk(groupId.organizerId, {
    attributes:['id', 'firstName', 'lastName']
  });
  const payloadOrganizer = Organizer.toJSON();
  delete payloadOrganizer.Membership
  const groupImages = await GroupImage.findAll({
    where:{
      groupId:req.params.groupId
    },
    attributes:['id','url','preview']
  });
  const payloadGroupImages = [];
  groupImages.forEach(image => {
    payloadGroupImages.push(image.toJSON());
  })

  const Venues = await Venue.findAll({
    where:{
      groupId:req.params.groupId,
    },
    attributes:['id','groupId','address','city','state','lat','lng']
  });

  let payloadVenue = null;
  if(Venues.length > 0){
    payloadVenue = [];
    Venues.forEach(venue => {
      venue = venue.toJSON();
      delete venue.Event;
      payloadVenue.push(venue);
    })
  }

  const members = await Membership.findAll({
    where:{
      groupId:req.params.groupId,
    }
  })

  const payload = {
    id: payloadGroupId.id,
    organizerId: payloadGroupId.organizerId,
    name: payloadGroupId.name,
    about: payloadGroupId.about,
    type: payloadGroupId.type,
    private: payloadGroupId.private,
    city: payloadGroupId.city,
    state: payloadGroupId.state,
    createdAt: payloadGroupId.createdAt,
    updatedAt: payloadGroupId.updatedAt,
    numMembers: members.length,
    GroupImages: payloadGroupImages,
    Organizer: payloadOrganizer,
    Venues: payloadVenue,
  }

  return res.json(payload);
})

//post /api/groups
router.post('', requireAuth, async (req,res, next) =>{
    const {name,about,type,private,city,state} = req.body;
    const {user} = req;
    const errors = {};

    //Name Checker
    let chars = name.split('');
    let count = 0;
    for(let char of chars){
      count++;
    }
    if(count > 60 || !name){
      errors.name = "Name must be 60 characters or less"
      res.status(400);
      return next({
        message:"Bad Request",
        errors:errors,
      })
    }

    //About Checker
    chars = about.split('');
    count = 0;
    for(let char of chars){
      count++;
    }
    if(count < 50){
      errors.about = "About must be 50 characters or more"
      res.status(400);
      return next({
        message:"Bad Request",
        errors:errors,
      })
    }

    //Type Checker
    if(type.toLowerCase() !== "online" && type.toLowerCase() !== "in person"){
      errors.type = "Type must be 'Online' or 'In person'"
      res.status(400);
      return next({
        message:"Bad Request",
        errors:errors,
      })
    }

    //Private Checker
    if(typeof private !== "boolean" || !private){
      res.status(400);
      errors.private = "Private must be boolean";
      return next({
        message:"Bad Request",
        errors:errors,
      })
    }

    //City Checker
    if(!city){
      res.status(400);
      errors.city = "City is required";
      return next({
        message:"Bad Request",
        errors:errors,
      })
    }

    //State Checker
    if(!state){
      res.status(400);
      errors.state = "State is required";
      return next({
        message:"Bad Request",
        errors:errors,
      })
    }

    const newGroup = await Group.create({
      name:name,
      organizerId: user.id,
      about:about,
      type:type,
      private:private,
      city:city,
      state:state
    })

    newGroup.createMembership({
      userId:user.id,
      groupId:newGroup.id,
      status:'host',
    })

    res.status(201);
    return res.json(newGroup.toJSON());
})

//post /api/groups/:groupId/images
router.post('/:groupId/images', requireAuth, async (req,res,next) => {
  const group = await Group.findByPk(req.params.groupId);

  if(!group){
    res.status(404);
    return next({
      message:"Group couldn't be found",
    })
    }

  const {preview, url} = req.body;
  const {user} = req;

  if(user.id !== group.organizerId){
    res.status(403);
    return next({
      message:"Forbidden",
    })
  }

  let newImage = await group.createGroupImage({
    groupId:req.params.groupId,
    url:url,
    preview:preview,
  })

  newImage = newImage.toJSON();
  delete newImage.groupId;
  delete newImage.updatedAt;
  delete newImage.createdAt;

  return res.json(newImage);
})

//put /api/groups/:groupId
router.put('/:groupId', requireAuth, async (req,res,next) => {
  let updatedGroup = await Group.findByPk(req.params.groupId);

  if(!updatedGroup){
    return next({
      message:"Group couldn't be found",
    })
    }

  const {user} = req;

  if(user.id !== updatedGroup.organizerId){
    res.status(403);
    return next({
      message:"Forbiddem"
    })
  }

  const {name,about,type,private,city,state} = req.body;
  let errors = {};

  if(name !== undefined){
    //Name Checker
    let chars = name.split('');
    let count = 0;
    console.log(chars.length);
    for(let char of chars){
      count++;
    }
    if(count > 60 || chars.length == 0){
      errors.name = "Name must be 60 characters or less"
      return next({
        message:"Bad Request",
        errors:errors,
      })
    }
    updatedGroup.name = name;
  }

  if(about !== undefined){

     //About Checker
     chars = about.split('');
     count = 0;
     for(let char of chars){
       count++;
     }
     if(count < 50){
       errors.about = "About must be 50 characters or more"
       return next({
         message:"Bad Request",
         errors:errors,
       })
     }

    updatedGroup.about = about;
  }

  if(type !== undefined){

    if(type.toLowerCase() !== "online" && type.toLowerCase() !== "in person"){
      errors.type = "Type must be 'Online' or 'In person'"
      return next({
        message:"Bad Request",
        errors:errors,
      })
    }

    updatedGroup.type = type;
  }

  if(private !== undefined){

    if(typeof private !== "boolean"){
      errors.private = "Private must be boolean";
      return next({
        message:"Bad Request",
        errors:errors,
      })
    }

    updatedGroup.private = private;
  }

  if(city !== undefined){
        //City Checker
        if(!city){
          errors.city = "City is required";
          return next({
            message:"Bad Request",
            errors:errors,
          })
        }

    updatedGroup.city = city;
  }

  if(state !== undefined){
    if(!state){
      errors.state = "State is required";
      return next({
        message:"Bad Request",
        errors:errors,
      })
    }
    updatedGroup.state = state;
  }
  await updatedGroup.save();

  updatedGroup = updatedGroup.toJSON();

  return res.json(updatedGroup);
})

//delete /api/groups/:groupId
router.delete('/:groupId', requireAuth, async (req, res, next) => {
  const deleteGroup = await Group.findByPk(req.params.groupId);
  const {user} = req;

  if(!deleteGroup){
    return next({
      message:"Group couldn't be found",
    })
    }

  if(deleteGroup.organizerId !== user.id){
    return next({
      message:"forbidden",
    })
  }

  await deleteGroup.destroy();

  return res.json({
    message: "Successfully deleted"
  })
})

//get /:groupId/venues
router.get('/:groupId/venues', requireAuth, async (req,res,next) => {
  const {user} = req;
  const findGroup = await Group.findByPk(req.params.groupId)
  if(!findGroup){
    return next({
      message:"Group couldn't be found",
    })
  }

  const findMembership = await Membership.findOne({
    where:{
      userId:user.id,
      groupId:findGroup.id,
    }
  })

  if((findMembership == null || findMembership.status !== "co-host") && user.id !== findGroup.organizerId){
    return next({message:"Forbidden"});
  }

  const allVenues = await Venue.findAll({
    where:{
      groupId: req.params.groupId,
    }
  })

  let sentVenues = [];

  allVenues.forEach(venue => {
    sentVenues.push(venue.toJSON());
  })

  if(sentVenues.length === 0){
    sentVenues = null;
  }

  return res.json({Venues:sentVenues});
})

//post /:groupId/venues
router.post('/:groupId/venues', requireAuth, async (req,res,next) => {
  const {user} = req;

  const {address, city, state, lat, lng} = req.body;

  const foundGroup = await Group.findByPk(req.params.groupId);

  const errors = {};

  if(!foundGroup){
    return next({message:"Group couldn't be found"});
  }

  const findMembership = await Membership.findOne({
    where:{
      userId:user.id,
      groupId:foundGroup.id,
    }
  })

  if((findMembership == null || findMembership.status !== "co-host") && user.id !== foundGroup.organizerId){
    return next({message:"Forbidden"});
  }


  if(!address) {
    errors.address = 'Street address is required'
    return next({
      message: "Bad Request",
      errors: errors,
    });
  }

  if(!city){
    errors.city = 'City is required'
    return next({
      message: "Bad Request",
      errors: errors,
    });
  }

  if(!state){
    errors.state = 'State is required'
    return next({
      message: "Bad Request",
      errors: errors,
    });

  }

  if((lat > 90 || lat < -90) && typeof lat !== "integer"){
    errors.lat = 'Latitude is not valid'
    return next({
      message: "Bad Request",
      errors: errors,
    });
  }

  if(lng > 180 || lng < -180 && typeof lng !== "integer"){
    errors.lng = 'Longitude is not valid'
    return next({
      message: "Bad Request",
      errors: errors,
    });
  }

  let newVenue = await foundGroup.createVenue({
    groupId:req.params.groupId,
    address:address,
    city:city,
    state:state,
    lat:lat,
    lng:lng
  })

  newVenue = newVenue.toJSON();

  delete newVenue.updatedAt;
  delete newVenue.createdAt;

  return res.json(newVenue);
})

//get /:groupId/events
router.get('/:groupId/events',  async (req,res,next) => {
  let findGroup = await Group.findByPk(req.params.groupId);

  if(!findGroup){
    return next({message:"Group couldn't be found"});
  }

  let foundEvents = await Event.findAll({
    where:{
      groupId:req.params.groupId,
    },
    include: [{
      model:Group,
      attributes:['id', 'name', 'city', 'state']
    },
    {
      model:Venue,
      attributes:['id', 'city', 'state']
    }]
  })

  let pushedEvents = [];

  for(let i = 0; i < foundEvents.length; i++){
    let event = foundEvents[i];
    let attendance = await Attendance.findAll({
      where:{
        eventId:event.id,
      }
    })
    let eventImage = await EventImage.findOne({
      where:{
        eventId:event.id,
      }
    })
    event = event.toJSON();
    delete event.createdAt;
    delete event.updatedAt;
    event.numAttending = attendance.length;
    event.previewImage = eventImage.url;
    pushedEvents.push(event);
  }

  if(pushedEvents.length == 0){
    pushedEvents = "There are no events right now";
  }

  return res.json({Events:pushedEvents});
})

//post /:groupId/events
router.post('/:groupId/events', requireAuth, async (req,res,next) => {
  const group = await Group.findByPk(req.params.groupId);
  const {user} = req;

  if(!group){
    return next({
      message:"Group couldn't be found",
    })
  }

  const grabMembership = await Membership.findOne({
    where:{
      userId:user.id,
      groupId:req.params.groupId,
    }
  })

  if(!grabMembership){
    return next({message:"Forbidden"});
  } else if (user.id !== group.organizerId && grabMembership.status !== 'co-host'){
    return next({message:"Forbidden"});
  }

  const errors = {};
  const {venueId, name, type, capacity, price, description, startDate, endDate} = req.body;

  let checkVenue = await Venue.findByPk(venueId);


  if(!checkVenue){
    errors.venueId = "Venue does not exist";
    return next({
      message:"Bad Request",
      errors:errors
    })
  }

  if(name.length < 5){
    errors.name = "Name must be at least 5 characters";
    return next({
      message:"Bad Request",
      errors:errors
    })
  }

  if(type.toLowerCase() !== "online" && type.toLowerCase() !== "in person"){
    errors.type = "Type must be 'Online' or 'In person'"
    return next({
      message:"Bad Request",
      errors:errors,
    })
  }


  if(typeof capacity !== "number"){
    errors.capacity = "Capacity must be an integer";
    return next({
      message:"Bad Request",
      errors:errors
    })
  }

  if(price < 0 || typeof price !== "number"){
    errors.price = "Price is invalid";
    return next({
      message:"Bad Request",
      errors:errors
    })
  }

  if(!description){
    errors.description = "Description is required"
    return next({
      message:"Bad Request",
      errors:errors
    })
  }

  if(new Date(startDate) <= new Date()){
    errors.startDate = "Start date must be in the future";
    return next({
      message:"Bad Request",
      errors:errors
    })
  }

  if(new Date(endDate) < new Date(startDate)){
    errors.endDate = "End date is less than start date";
    return next({
      message:"Bad Request",
      errors:errors
    })
  }


  let newEvent = await group.createEvent({
    venueId:venueId,
    name:name,
    type:type,
    capacity:capacity,
    price:price,
    description:description,
    startDate:startDate,
    endDate:endDate
  })

  let newAttendance = await Attendance.create({
    eventId:newEvent.id,
    userId: user.id,
    status: 'attending'
  })

  newEvent = newEvent.toJSON();

  return res.json(newEvent);
})

//get /:groupId/members
router.get('/:groupId/members', async (req,res,next) => {
  const {user} = req;

  const foundGroup = await Group.findByPk(req.params.groupId);

  if(!foundGroup){
    return next({message:"Group couldn't be found"})
  }

  const members = await foundGroup.getMemberships();
  const users = await foundGroup.getUsers();
  const sendingUsers = [];

  let cohostCheck = false;

  members.forEach(member => {
    if(user.id == member.userId){
      if(member.status.toLowerCase() == 'co=host'){
        cohostCheck = true;
      }
    }
  })

  if(user.id == foundGroup.organizerId || cohostCheck == true){
    users.forEach(user => {
    sendingUsers.push(user.toJSON());
    })
  } else {
    users.forEach(user => {
      if(user.Membership.status !== 'pending'){
        sendingUsers.push(user.toJSON());
      }
    })
  }

  sendingUsers.forEach(user => {
    delete user.username;
    delete user.Membership.id;
    delete user.Membership.userId;
    delete user.Membership.groupId;
    delete user.Membership.createdAt;
    delete user.Membership.updatedAt;
  })

  return res.json({Members:sendingUsers});
})

//post /:groupId/membership
router.post('/:groupId/membership', requireAuth, async (req, res, next) => {
  const foundGroup = await Group.findByPk(req.params.groupId);
  const {user} = req;
  if(!foundGroup){
    return next({message:"Group couldn't be found"})
  }

  const checkMembership = await Membership.findOne({
    where:{
      userId:user.id,
      groupId:req.params.groupId
    }
  })

  if(checkMembership){
    if(checkMembership.status !== 'pending'){
      return next({message:"User is already a member of the group"});
    } else {
      return next({message:"Membership has already been requested"});
    }
  }

  let newMember = foundGroup.createMembership({
  groupId:req.params.groupId,
  userId: user.id,
  status:'pending'
  })

  return res.json({
    userId:user.id,
    status:'pending'
  });
})

//put /:groupId/membership
router.put('/:groupId/membership', requireAuth, async(req,res,next) => {
  const {memberId, status} = req.body;
  const {user} = req;
  let checkGroup = await Group.findByPk(req.params.groupId);
  if(!checkGroup){
    return next({message:"Group couldn't be found"});
  }

  let foundMembership = await Membership.findOne({
    where:{
      userId:memberId,
      groupId:req.params.groupId
    }
  });

  let userStatus = await Membership.findOne({
    where:{
      groupId:req.params.groupId,
      userId:user.id,
    }
  });

  if(userStatus.status.toLowerCase() !== 'co-host' && userStatus.status.toLowerCase() !== 'host'){
    return next({message:"Current User must already be the organizer or have a membership to the group with the status of co-host"})
  }

  if(!foundMembership){
    return next({message:"Membership between the user and the group does not exist"})
  }


  if(status.toLowerCase() == 'pending')
    return next({message:"Cannot change a membership to pending"});

  if(status.toLowerCase() == 'member' && foundMembership.status.toLowerCase() == 'pending')
    foundMembership.status = 'member';



  if(status.toLowerCase() == 'co-host'){
    if(user.id == checkGroup.organizerId){
      foundMembership.status = 'co-host';
    } else {
      return next({message:"To change to co-host user must be organizer"})
    }
  }


  await foundMembership.save();

  foundMembership = foundMembership.toJSON();
  checkGroup = checkGroup.toJSON();

  return res.json({
    id:foundMembership.id,
    groupId:foundMembership.groupId,
    memberId:foundMembership.userId,
    status:foundMembership.status
  });
})

//delete /:groupId/membership
router.delete('/:groupId/membership', requireAuth, async (req,res,next) => {
  const {memberId} = req.body;
  const {user} = req;
  let checkGroup = await Group.findByPk(req.params.groupId);

  if(!checkGroup){
    return next({message:"Group couldn't be found"});
  }

  let checkUser = await User.findByPk(memberId);

  if(!checkUser){
    return next({message:"User couldn't be found"})
  }

  let checkMembership = await Membership.findOne({
    where:{
      userId:user.id,
      groupId:req.params.groupId,
    }
  });


  if((!checkMembership || checkMembership.status !== "host") && user.id !== memberId){
    return next({message:"Forbidden"});
  }

  let foundMembership = await Membership.findOne({
    where:{
      userId:memberId,
      groupId:req.params.groupId
    }
  })


  if(!foundMembership){
    return next({message:"Membership between the user and the group does not exist"})
  }

  let events = await Event.findAll({
    where:{
      groupId:req.params.groupId,
    }
  })

  for(let i = 0; i < events.length; i++){
    let event = events[i];
    let grabAttendance = await Attendance.findOne({
      where:{
        userId:memberId,
         eventId:event.id,
      }
    })
    if(grabAttendance){
     await grabAttendance.destroy();
    }
  }
  await foundMembership.destroy();

  return res.json({
    message: "Successfully deleted membership from group"
  })
})


module.exports = router;
