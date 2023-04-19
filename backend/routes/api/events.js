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

router.get("/", async (req,res) => {
  const events = await Event.findAll();

  let eventsList = [];

  events.forEach(event => {
    eventsList.push(event.toJSON());
  })

  return res.json({Events:eventsList});

})

module.exports = router;
