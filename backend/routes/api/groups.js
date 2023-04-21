const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { Group, User, GroupImage, Membership, Event, Venue } = require('../../db/models');
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
    const groups = await Group.findAll();

    let groupsList = [];

    groups.forEach(group => {
      groupsList.push(group.toJSON());
    })

    return res.json({Groups:groupsList});
})

//get /api/groups/current
router.get('/current', requireAuth, async (req, res) => {
  const {user} = req;
  let userId = user.id;
  let currentGroups = await Group.findAll({where:{
    organizerId:userId,
  }})

  let currentGroupsList = [];

  currentGroupsList.forEach(group => {
    currentGroupsList.push(group.toJSON());
  })

  return res.json(currentGroups);
})

//get api/groups/:groupId
router.get('/:groupId', async(req,res, next) => {
  const groupId = await Group.findByPk(req.params.groupId);

  if(!groupId){
  return next({
    message:"Group couldn't be found",
  });
  }

  const payloadGroupId = groupId.toJSON();
  const Organizer = await groupId.getUsers({where:groupId.organizerId});
  const payloadOrganizer = Organizer[0].toJSON();
  const groupImages = await groupId.getGroupImages();
  const payloadGroupImages = groupImages[0].toJSON();
  const Venues = await groupId.getVenues({
    attributes:['id','groupId','address','city','state','lat','lng']
  });
  const payloadVenue = Venues[0].toJSON();

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
    GroupImages: payloadGroupImages,
    Organizer: payloadOrganizer,
    Venues: payloadVenue,
  }

  delete payload.Venues.Event;

  return res.json(payload);
})

//post /api/groups
router.post('', async (req,res, next) =>{
    const {name,about,type,private,city,state} = req.body;
    const errors = {};

    //Name Checker
    let chars = name.split('');
    let count = 0;
    for(let char of chars){
      count++;
    }
    if(count > 60){
      errors.name = "Name must be 60 characters or less"
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
      return next({
        message:"Bad Request",
        errors:errors,
      })
    }

    //Type Checker
    if(type.toLowerCase() !== "virtual" && type.toLowerCase() !== "in-person"){
      errors.type = "Type must be 'Virtual' or 'In-Person'"
      return next({
        message:"Bad Request",
        errors:errors,
      })
    }

    //Private Checker
    if(typeof private !== "boolean"){
      errors.private = "Private must be boolean";
      return next({
        message:"Bad Request",
        errors:errors,
      })
    }

    //City Checker
    if(!city){
      errors.city = "City is required";
      return next({
        message:"Bad Request",
        errors:errors,
      })
    }

    //State Checker
    if(!state){
      errors.state = "State is required";
      return next({
        message:"Bad Request",
        errors:errors,
      })
    }

    const newGroup = await Group.create({
      name:name,
      organizerId: 2,
      about:about,
      type:type,
      private:private,
      city:city,
      state:state
    })

    return res.json(newGroup.toJSON());
})

//post /api/groups/:groupId/images
router.post('/:groupId/images', async (req,res,next) => {
  const group = await Group.findByPk(req.params.groupId);

  if(!group){
    return next({
      message:"Group couldn't be found",
    })
    }

  const {preview, url} = req.body;

  let newImage = await group.createGroupImage({
    groupId:req.params.groupId,
    url:url,
    preview:preview,
  })

  newImage = newImage.toJSON();
  delete newImage.id;
  delete newImage.groupId;
  delete newImage.updatedAt;
  delete newImage.createdAt;

  return res.json(newImage);
})

//put /api/groups/:groupId
router.put('/:groupId', async (req,res,next) => {
  let updatedGroup = await Group.findByPk(req.params.groupId);

  if(!updatedGroup){
    return next({
      message:"Group couldn't be found",
    })
    }

  const {name,about,type,private,city,state} = req.body;
  let errors = {};

  if(name !== undefined){
    //Name Checker
    let chars = name.split('');
    let count = 0;
    for(let char of chars){
      count++;
    }
    if(count > 60){
      errors.name = "Name must be 60 characters or less"
      next({
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

    if(type.toLowerCase() !== "virtual" && type.toLowercase() !== "in-person"){
      errors.type = "Type must be 'Virtual' or 'In-Person'"
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
router.delete('/:groupId', async (req, res, next) => {
  const deleteGroup = await Group.findByPk(req.params.groupId);

  if(!deleteGroup){
    return next({
      message:"Group couldn't be found",
    })
    }

  await deleteGroup.destroy();

  return res.json({
    message: "Successfully deleted"
  })
})

//get /:groupId/venues
router.get('/:groupId/venues', async (req,res,next) => {
  const allVenues = await Venue.findAll({
    where:{
      groupId: req.params.groupId,
    }
  })

  const sentVenues = [];

  allVenues.forEach(venue => {
    sentVenues.push(venue.toJSON());
  })

  if(sentVenues.length === 0){
    return next({
      message:"Group couldn't be found",
    })
  }

  return res.json({Venues:sentVenues});
})

//post /:groupId/venues
router.post('/:groupId/venues', async (req,res,next) => {
  const {address, city, state, lat, lng} = req.body;

  const foundGroup = await Group.findByPk(req.params.groupId);

  const errors = {};

  if(!foundGroup){
    return next({message:"Group couldn't be found"});
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

  if(lat > 90 || lat < -90){
    errors.lat = 'Latitude is not valid'
    return next({
      message: "Bad Request",
      errors: errors,
    });
  }

  if(lng > 180 || lng < -180){
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
router.get('/:groupId/events', async (req,res,next) => {
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

  foundEvents.forEach(event => {
    let ele = event.toJSON();
    delete ele.updatedAt;
    delete ele.createdAt;
    pushedEvents.push(ele);
  })

  if(pushedEvents.length === 0){
    return next({
      message:"Group couldn't be found",
    })
  }

  return res.json({Events:pushedEvents});
})

//post /:groupId/events
router.post('/:groupId/events', async (req,res,next) => {
  const group = await Group.findByPk(req.params.groupId);

  if(!group){
    return next({
      message:"Group couldn't be found",
    })
  }

  const errors = {};
  const {venueId, name, type, capacity, price, description, startDate, endDate} = req.body;

  let checkVenue = await Venue.findByPk(venueId);

  if(!checkVenue){
    errors.venueId = "Venue does not exist";
    next({
      message:"Bad Request",
      errors:errors
    })
  }

  if(name.length < 5){
    errors.name = "Name must be at least 5 characters";
    next({
      message:"Bad Request",
      errors:errors
    })
  }

  if(type.toLowerCase() !== "virtual" && type.toLowercase() !== "in-person"){
    errors.type = "Type must be 'Virtual' or 'In-Person'"
    return next({
      message:"Bad Request",
      errors:errors,
    })
  }

  if(typeof capacity !== "Integer"){
    errors.capacity = "Capacity must be an integer";
    return next({
      message:"Bad Request",
      errors:errors
    })
  }

  if(price < 0){
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

  if(startDate <= new Date()){
    errors.startDate = "Start date must be in the future";
    return next({
      message:"Bad Request",
      errors:errors
    })
  }

  if(endDate < startDate){
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

  newEvent = newEvent.toJSON();

  return res.json(newEvent);
})

//get /:groupId/members
router.get('/:groupId/members', async (req,res,next) => {
  const {user} = req;

  const foundGroup = await Group.findByPk(req.params.groupId);
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

  if(!foundGroup){
    return next({message:"Group couldn't be found"})
  }

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
router.post('/:groupId/membership', async (req, res, next) => {
  const foundGroup = await Group.findByPk(req.params.groupId);
  const {user} = req;
  if(!foundGroup){
    return next({message:"Group couldn't be found"})
  }
  const members = await foundGroup.getMemberships();

  for(let i = 0; i < members.length; i++){
    if(members[i].userId === user.id){
      if(members[i].status.toLowerCase() == "member"){
        return next({
          "message": "User is already a member of the group",
        })
      }
      else if(members[i].status.toLowerCase() == "pending"){
        return next({
          "message": "Membership has already been requested",
        })
      }
    }
  }

  let newMember = foundGroup.createMembership({
  groupId:req.params.groupId,
  userId: user.id,
  status:'Pending'
  })

  return res.json({
    userId:user.id,
    status:'Pending'
  });
})

//put /:groupId/membership
router.put('/:groupId/membership', async(req,res,next) => {
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
      userId:user.id,
    }
  });

  if(userStatus.status.toLowerCase() !== 'co-host'){
    return next({message:"Current User must already be the organizer or have a membership to the group with the status of co-host"})
  }

  if(!foundMembership){
    return next({message:"Membership between the user and the group does not exist"})
  }


  if(status.toLowerCase() == 'pending')
    return next({message:"Cannot change a membership to pending"});

  if(status.toLowerCase() == 'member' && foundMembership.status.toLowerCase() == 'pending')
    foundMembership.status = 'Member';

  if(user.id == checkGroup.organizerId){
    if(status.toLowerCase() == 'co-host'){
      console.log("hi");
      foundMembership.status = 'Co-Host';
    }
  }

  await foundMembership.save();

  foundMembership = foundMembership.toJSON();
  checkGroup = checkGroup.toJSON();

  return res.json(foundMembership);

  return res.json({
    id:user.id,
    groupId: req.params.groupId,
    memberId: memberId,
    status: foundMembership.status
  });
})

//delete /:groupId/membership
router.delete('/:groupId/membership', async (req,res,next) => {
  const {memberId} = memberId;
  const {user} = req;
  let checkGroup = await Group.findByPk(req.params.groupId);
  if(!checkGroup){
    return next({message:"Group couldn't be found"});
  }

  let foundMembership = await Membership.findByPk(memberId);

  if(!foundMembership){
    return next({message:"Membership between the user and the group does not exist"})
  }

  if(foundMembership.userId !== user.id){
    return next({message:"User couldn't be found"})
  }

  await foundMembership.destroy();

  return res.json({
    message: "Successfully deleted membership from group"
  })
})


module.exports = router;
