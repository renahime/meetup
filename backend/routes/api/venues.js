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
    const err = new Error("Venue couldn't be found.");
    err.title = "Resource not found";
    err.errors = {message:"Venue couldn't be found"};
    err.status = 404;
    return next(err);
  }

  let grabMembership = await Membership.findOne({
    where:{
      groupId:foundVenue.groupId,
      userId:user.id
    }
  });

  if(!grabMembership || (grabMembership.status !== "organizer" && grabMembership.status!= "co-host")){
    const err = new Error("Forbidden");
    err.title = "Forbidden";
    err.errors = {message:"User is not authorized"};
    err.status = 403
    return next(err)
  }

  const {address, city, state, lat, lng} = req.body;

  if(address !== undefined) {
    if(!address){
    const err = new Error("Bad Request.");
    err.title = "Bad Request";
    err.errors = {message:"Street address is required"};
    err.status = 400;
    return next(err);
    }
    foundVenue.address = address;
  }

  if(city !== undefined){
    if(!city){
    const err = new Error("Bad Request.");
    err.title = "Bad Request";
    err.errors = {message:"City is required"};
    err.status = 400;
    return next(err);
    }
    foundVenue.city = city;
  }

  if(state !== undefined){
    if(!state){
    const err = new Error("Bad Request.");
    err.title = "Bad Request";
    err.errors = {message:"State is required"};
    err.status = 400;
    return next(err);
    }
    foundVenue.state = state;
  }

  if(lat !== undefined && typeof lat !== "integer"){
      if(lat > 90 || lat < -90){
        const err = new Error("Bad Request.");
        err.title = "Bad Request";
        err.errors = {message:"Latitude is not valid"};
        err.status = 400;
        return next(err);
    }
    foundVenue.lat = lat;
  }

  if(lng !== undefined){
      if(lng > 180 || lng < -180 && typeof lng !== "integer"){
        const err = new Error("Bad Request.");
        err.title = "Bad Request";
        err.errors = {message:"Longitude is not valid"};
        err.status = 400;
        return next(err);
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
