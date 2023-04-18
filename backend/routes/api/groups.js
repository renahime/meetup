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
router.get('/:groupId', async(req,res) => {
  const groupId = await Group.findByPk(req.params.groupId);
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
router.post('', async (req,res) =>{
    const {name,about,type,private,city,state} = req.body;
    const newGroup = await Group.create({
      name:name,
      organizerId: 2,
      about:about,
      type:type,
      private:private,
      city:city,
      state:state
    })
    return res.json(newGroup);
})

//post /api/groups/:groupId/images
router.post('/:groupId/images', async (req,res) => {
  const group = await Group.findByPk(req.params.groupId);
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
router.put('/:groupId', async (req,res) => {
  let updatedGroup = await Group.findByPk(req.params.groupId);
  const {name,about,type,private,city,state} = req.body;

  if(name !== undefined){
    updatedGroup.name = name;
  }
  if(about !== undefined){
    updatedGroup.about = about;
  }
  if(type !== undefined){
    updatedGroup.type = type;
  }
  if(private !== undefined){
    updatedGroup.private = private;
  }
  if(city !== undefined){
    updatedGroup.city = city;
  }
  if(state !== undefined){
    updatedGroup.state = state;
  }
  await updatedGroup.save();

  updatedGroup = updatedGroup.toJSON();

  return res.json(updatedGroup);

})

module.exports = router;
