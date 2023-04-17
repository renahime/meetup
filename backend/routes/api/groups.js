const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { Group, User, GroupImage, Membership, Event, Venue } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { group } = require('console');


const router = express.Router();

//get api/groups
router.get('', async (req,res) => {
    const groups = await Group.findAll();

    return res.json({Groups:groups});
})

//get api/groups/:groupId
router.get('/:groupId', async(req,res) => {
  const groupId = await Group.findByPk(req.params.groupId,{
    include: [
      {
        model:GroupImage,
        attributes: ['id','url','preview']
      },
      {
        model:User,
        as: 'Organizer',
        attributes: ['id','firstName','lastName'],
      },
      {
        model:Venue,
        attributes:['id','groupId','address','city','state','lat','lng'],
      }
    ],
  })

  return res.json(groupId);
})

module.exports = router;
