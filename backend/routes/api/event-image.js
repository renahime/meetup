const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { Group, User, GroupImage, Membership, Event, Venue, EventImage } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { group, error } = require('console');
const { requireAuth } = require('../../utils/auth');
const { url } = require('inspector');
const e = require('express');
const user = require('../../db/models/user');

const router = express.Router();
router.delete('/:imageId', async (req,res,next) => {
  const {user} = req;
  const foundImage = await EventImage.findByPk(req.params.imageId);
  if(!foundImage){
    return next({message:"Group Image couldn't be found"})
  }

  const findEvent = await Event.findByPk(foundImage.eventId);

  const findMembership = await Membership.findOne({
    where:{
      userId:user.id,
      groupId: findEvent.groupId,
    }
  })


  if((!findMembership) || (findMembership.status !== 'host' && findMembership.status !== 'co-host')){
    return next({message:"Forbidden"})
  }

  foundImage.destroy();
  return res.json({
    "message": "Successfully deleted",
  }
  );
});

module.exports = router;
