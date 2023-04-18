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


//get api/groups
router.get('', async (req,res) => {
    const groups = await Group.findAll();

    let groupsList = [];

    groups.forEach(group => {
      groupsList.push(group.toJSON());
    })

    return res.json({Groups:groupsList});
})

//get api/groups/:groupId
router.get('/:groupId', async(req,res, next) => {
  const groupId = await Group.findByPk(req.params.groupId);

  if(!groupId){
  next({
    message:"Group couldn't be found",
  })
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
      next({
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
      next({
        message:"Bad Request",
        errors:errors,
      })
    }

    //Type Checker
    if(type.toLowerCase() !== "virtual" || type.toLowercase() !== "in-person"){
      errors.type = "Type must be 'Virtual' or 'In-Person'"
      next({
        message:"Bad Request",
        errors:errors,
      })
    }

    //Private Checker
    if(typeof private !== "boolean"){
      errors.private = "Private must be boolean";
      next({
        message:"Bad Request",
        errors:errors,
      })
    }

    //City Checker
    if(!city){
      errors.city = "City is required";
      next({
        message:"Bad Request",
        errors:errors,
      })
    }

    //State Checker
    if(!state){
      errors.state = "State is required";
      next({
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
    next({
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
    next({
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
       next({
         message:"Bad Request",
         errors:errors,
       })
     }

    updatedGroup.about = about;
  }

  if(type !== undefined){

    if(type.toLowerCase() !== "virtual" || type.toLowercase() !== "in-person"){
      errors.type = "Type must be 'Virtual' or 'In-Person'"
      next({
        message:"Bad Request",
        errors:errors,
      })
    }

    updatedGroup.type = type;
  }

  if(private !== undefined){

    if(typeof private !== "boolean"){
      errors.private = "Private must be boolean";
      next({
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
          next({
            message:"Bad Request",
            errors:errors,
          })
        }

    updatedGroup.city = city;
  }

  if(state !== undefined){
    if(!state){
      errors.state = "State is required";
      next({
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

router.delete('/:groupId', async (req, res) => {
  const deleteGroup = await Group.findByPk(req.params.groupId);
  await deleteGroup.destroy();

  res.json({
    message: "Successfully deleted"
  }
  )
})

module.exports = router;
