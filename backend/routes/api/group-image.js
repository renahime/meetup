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
router.delete('/:imageId', async (req,res,next) => {
  const foundImage = await GroupImage.findByPk(req.params.imageId);
  if(!foundImage){
    return next({message:"Group Image couldn't be found"})
  }

  foundImage.destory();

  return res.json({
    "message": "Successfully deleted",
  }
  );
});


module.exports = router;