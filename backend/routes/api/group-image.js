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
//delete /group-images/:imageId
router.delete('/:imageId', requireAuth, async (req,res,next) => {
  const {user} = req;

  const foundImage = await GroupImage.findByPk(req.params.imageId);
  console.log(foundImage);
  if(!foundImage){
    const err = new Error("GroupImage couldn't be found.");
    err.title = "Resource not found";
    err.errors = {message:"GroupImage couldn't be found"};
    err.status = 404;
    return next(err);
  }
  const  findMembership = await Membership.findOne({
    where:{
      userId:user.id,
      groupId:foundImage.groupId,
    }
  })

  console.log(findMembership);

  if((!findMembership) || (findMembership.status !== 'organizer' && findMembership.status !== 'co-host')){
    const err = new Error("Forbidden");
    err.title = "Forbidden";
    err.errors = {message:"User is not authorized"};
    err.status = 403
    return next(err)
  }

  await foundImage.destroy();

  return res.json({
    "message": "Successfully deleted",
  }
  );
});


module.exports = router;
