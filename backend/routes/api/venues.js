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

//put /venues/:venueId
router.put('/:venueId',requireAuth, async (req,res,next) => {
  let foundVenue = await Venue.findByPk(req.params.venueId);
  const {user} = req;
  const errors = {};

  if(!foundVenue){
    return next({message:"Venue couldn't be found"});
  }

  let grabMembership = await Membership.findOne({
    where:{
      groupId:foundVenue.groupId,
      userId:user.id
    }
  });

  if(!grabMembership || (grabMembership.status !== "host" && grabMembership.status!= "co-host")){
    return next({message:"Forbidden"});
  }

  const {address, city, state, lat, lng} = req.body;

  if(address !== undefined) {
    if(!address){
      errors.address = 'Street address is required'
      return next({
        message: "Bad Request",
        errors: errors,
      });
    }
    foundVenue.address = address;
  }

  if(city !== undefined){
    if(!city){
      errors.city = 'City is required'
      return next({
        message: "Bad Request",
        errors: errors,
      });
    }
    foundVenue.city = city;
  }

  if(state !== undefined){
    if(!state){
      errors.state = 'State is required'
      return next({
        message: "Bad Request",
        errors: errors,
      });
    }
    foundVenue.state = state;
  }

  if(lat !== undefined && typeof lat !== "integer"){
      if(lat > 90 || lat < -90){
        errors.lat = 'Latitude is not valid'
        return next({
          message: "Bad Request",
          errors: errors,
        });
    }
    foundVenue.lat = lat;
  }

  if(lng !== undefined){
      if(lng > 180 || lng < -180 && typeof lng !== "integer"){
        errors.lng = 'Longitude is not valid'
        return next({
          message: "Bad Request",
          errors: errors,
        });
      }
      foundVenue.lng = lng;
    }
    await foundVenue.save();

    foundVenue = foundVenue.toJSON();

    delete foundVenue.createdAt;
    delete foundVenue.updatedAt;

    return res.json(foundVenue);
 })



module.exports = router;
