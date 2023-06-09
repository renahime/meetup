const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { Group, User, GroupImage, Membership, Event, Venue, Attendance, EventImage } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { group, error } = require('console');
const { requireAuth } = require('../../utils/auth');
const { url } = require('inspector');
const e = require('express');
const { resolveSoa } = require('dns');
const { stat } = require('fs');
const { isErrored } = require('stream');
const eventimage = require('../../db/models/eventimage');
const event = require('../../db/models/event');


const router = express.Router();


//get api/groups
router.get('', async (req, res) => {
  const groups = await Group.findAll();

  let groupsList = [];

  for (let i = 0; i < groups.length; i++) {
    let amount = await Membership.findAll({
      where: {
        groupId: groups[i].id,
      }
    })

    // let previewImage = await GroupImage.findOne({
    //   where:{
    //     groupId:groups[i].id,
    //   }
    // })

    let organizer = await User.findByPk(groups[i].organizerId);

    // if(previewImage){
    //   previewImage = previewImage.toJSON();
    //   previewImage = previewImage.url;
    // }
    let group = groups[i].toJSON();
    delete group.GroupImages;
    group.numMembers = amount.length;
    // group.previewImage = previewImage;
    group.Organizer = organizer;

    groupsList.push(group);
  }

  return res.json({ Groups: groupsList });
})

//get /api/groups/current
router.get('/current', requireAuth, async (req, res) => {
  const { user } = req;
  const grabMembership = await Membership.findAll({
    where: {
      userId: user.id
    }
  })

  const groupArr = [];

  for (let i = 0; i < grabMembership.length; i++) {
    let group = await Group.findByPk(grabMembership[i].groupId, {
      include: [{
        model: GroupImage,
        attributes: ['url'],
      }]
    })

    let amount = await Membership.findAll({
      where: {
        groupId: group.id,
      }
    })
    let previewImage = null;
    if (group.GroupImages.length !== 0) {
      previewImage = group.GroupImages[0].url;
    }
    group = group.toJSON();
    delete group.GroupImages;
    group.numMembers = amount.length
    group.previewImage = previewImage;

    groupArr.push(group);
  }

  return res.json({ Groups: groupArr });
})


//get api/groups/:groupId
router.get('/:groupId', async (req, res, next) => {
  const groupId = await Group.findByPk(req.params.groupId);

  if (!groupId) {
    const err = new Error("Group couldn't be found.");
    err.title = "Resource not found";
    err.errors = { message: "Group couldn't be found" };
    err.status = 404;
    return next(err);
  }

  const payloadGroupId = groupId.toJSON();
  const Organizer = await User.findByPk(groupId.organizerId, {
    attributes: ['id', 'firstName', 'lastName']
  });
  const payloadOrganizer = Organizer.toJSON();
  delete payloadOrganizer.Membership
  const groupImages = await GroupImage.findAll({
    where: {
      groupId: req.params.groupId
    },
    attributes: ['id', 'url', 'preview']
  });

  let payloadGroupImages = [];

  if (groupImages.length !== 0) {
    groupImages.forEach(image => {
      payloadGroupImages.push(image.toJSON());
    })
  } else
    payloadGroupImages = "There are no images for this group";

  const Venues = await Venue.findAll({
    where: {
      groupId: req.params.groupId,
    },
    attributes: ['id', 'groupId', 'address', 'city', 'state', 'lat', 'lng']
  });

  let payloadVenue = null;
  if (Venues.length > 0) {
    payloadVenue = [];
    Venues.forEach(venue => {
      venue = venue.toJSON();
      delete venue.Event;
      payloadVenue.push(venue);
    })
  }

  const members = await Membership.findAll({
    where: {
      groupId: req.params.groupId,
    }
  })

  const payload = {
    id: payloadGroupId.id,
    organizerId: payloadGroupId.organizerId,
    name: payloadGroupId.name,
    about: payloadGroupId.about,
    type: payloadGroupId.type,
    private: payloadGroupId.private,
    city: payloadGroupId.city,
    state: payloadGroupId.state,
    previewImage: payloadGroupId.previewImage,
    createdAt: payloadGroupId.createdAt,
    updatedAt: payloadGroupId.updatedAt,
    numMembers: members.length,
    GroupImages: payloadGroupImages,
    Organizer: payloadOrganizer,
    Venues: payloadVenue,
  }

  return res.json(payload);
})

//post /api/groups
router.post('', requireAuth, async (req, res, next) => {
  const { name, about, type, private, city, state, previewImage } = req.body;
  const { user } = req;
  const errors = {};

  const organizer = await User.findByPk(user.id);
  const payloadOrganizer = organizer.toJSON();




  //Name Checker
  let chars = name.split('');
  let count = 0;
  for (let char of chars) {
    count++;
  }
  if (count > 60) {
    const err = new Error("Bad Request");
    err.title = "Bad Request";
    err.errors = { name: "Name must be 60 characters or less" };
    err.status = 400
    return next(err)
  } else if (!name) {
    const err = new Error("Bad Request");
    err.title = "Bad Request";
    err.errors = { name: "Name is required" };
    err.status = 400
    return next(err)
  }

  //About Checker
  chars = about.split('');
  count = 0;
  for (let char of chars) {
    count++;
  }
  if (count < 30) {
    const err = new Error("Bad Request");
    err.title = "Bad Request";
    err.errors = { about: "About must be 30 characters or more" };
    err.status = 400
    return next(err)
  }

  //Type Checker
  if (type.toLowerCase() !== "online" && type.toLowerCase() !== "in person") {
    const err = new Error("Bad Request");
    err.title = "Bad Request";
    err.errors = { type: "Type must be 'Online' or 'In person" };
    err.status = 400
    return next(err)
  }

  //Private Checker
  if ((private.toLowerCase() !== "private" && private.toLowerCase() !== "public") || !private) {
    const err = new Error("Bad Request");
    err.title = "Bad Request";
    err.errors = { private: "Must be public or private" };
    err.status = 400
    return next(err)
  }

  //City Checker
  if (!city) {
    const err = new Error("Bad Request");
    err.title = "Bad Request";
    err.errors = { city: "City is required" };
    err.status = 400
    return next(err)
  }

  //State Checker
  if (!state) {
    const err = new Error("Bad Request");
    err.title = "Bad Request";
    err.errors = { state: "State is required" };
    err.status = 400
    return next(err)
  }

  if ((!previewImage.includes('.jpg') && !previewImage.includes('.jpeg') && !previewImage.includes('.png'))) {
    const err = new Error("Bad Request");
    err.title = "Bad Request";
    err.errors = { previewImage: "Image URL must end in .png, .jpg, or .jpeg" },
      err.status = 400;
    return next(err);
  }

  const newGroup = await Group.create({
    name: name,
    organizerId: user.id,
    about: about,
    type: type,
    private: private,
    city: city,
    state: state,
    previewImage: previewImage,
  })

  const payloadGroup = newGroup.toJSON();


  newGroup.createMembership({
    userId: user.id,
    groupId: newGroup.id,
    status: 'organizer',
  })

  res.status(201);
  return res.json({
    id: payloadGroup.id,
    organizerId: payloadGroup.organizerId,
    name: payloadGroup.name,
    about: payloadGroup.about,
    type: payloadGroup.type,
    private: payloadGroup.private,
    city: payloadGroup.city,
    state: payloadGroup.state,
    createdAt: payloadGroup.createdAt,
    updatedAt: payloadGroup.updatedAt,
    Organizer: payloadOrganizer,
  });
})

//post /api/groups/:groupId/images
router.post('/:groupId/images', requireAuth, async (req, res, next) => {
  const group = await Group.findByPk(req.params.groupId);

  if (!group) {
    const err = new Error("Group couldn't be found.");
    err.title = "Resource not found";
    err.errors = { message: "Group couldn't be found" };
    err.status = 404;
    return next(err);
  }

  const { preview, url } = req.body;
  const { user } = req;

  if (user.id !== group.organizerId) {
    const err = new Error("Forbidden");
    err.title = "Forbidden";
    err.errors = { messaage: "Forbidden: User is not authorized for the request." };
    err.status = 403
    return next(err)
  }

  let newImage = await group.createGroupImage({
    groupId: req.params.groupId,
    url: url,
    preview: preview,
  })

  newImage = newImage.toJSON();
  delete newImage.groupId;
  delete newImage.updatedAt;
  delete newImage.createdAt;

  return res.json(newImage);
})

//put /api/groups/:groupId
router.put('/:groupId', requireAuth, async (req, res, next) => {
  let updatedGroup = await Group.findByPk(req.params.groupId);

  if (!updatedGroup) {
    const err = new Error("Group couldn't be found.");
    err.title = "Resource not found";
    err.errors = { message: "Group couldn't be found" };
    err.status = 404;
    return next(err);
  }

  const { user } = req;

  if (user.id !== updatedGroup.organizerId) {
    const err = new Error("Forbidden");
    err.title = "Forbidden";
    err.errors = { messaage: "Forbidden: User is not authorized for the request." };
    err.status = 403
    return next(err)
  }

  const { name, about, type, private, city, state, previewImage } = req.body;
  let errors = {};

  if (name !== undefined) {
    //Name Checker
    let chars = name.split('');
    let count = 0;
    for (let char of chars) {
      count++;
    }
    if (count > 60 || chars.length == 0) {
      const err = new Error("Bad Request");
      err.title = "Bad Request";
      err.errors = { name: "Name must be 60 characters or less" };
      err.status = 400
      return next(err)
    }
    updatedGroup.name = name;
  }

  if (about !== undefined) {

    //About Checker
    chars = about.split('');
    count = 0;
    for (let char of chars) {
      count++;
    }
    if (count < 30) {
      const err = new Error("Bad Request");
      err.title = "Bad Request";
      err.errors = { about: "About must be 30 characters or more" };
      err.status = 400
      return next(err)
    }

    updatedGroup.about = about;
  }

  if (type !== undefined) {

    if (type.toLowerCase() !== "online" && type.toLowerCase() !== "in person") {
      const err = new Error("Bad Request");
      err.title = "Bad Request";
      err.errors = { type: "Type must be 'Online' or 'In person" };
      err.status = 400
      return next(err)
    }

    updatedGroup.type = type;
  }

  if (private !== undefined) {

    if ((private.toLowerCase() !== "private" && private.toLowerCase() !== "public") || !private) {
      const err = new Error("Bad Request");
      err.title = "Bad Request";
      err.errors = { private: "Must be private or public" };
      err.status = 400
      return next(err)
    }

    updatedGroup.private = private;
  }

  if (city !== undefined) {
    //City Checker
    if (!city) {
      const err = new Error("Bad Request");
      err.title = "Bad Request";
      err.errors = { city: "City is required" };
      err.status = 400
      return next(err)
    }
    updatedGroup.city = city;
  }

  if (state !== undefined) {
    if (!state) {
      const err = new Error("Bad Request");
      err.title = "Bad Request";
      err.errors = { state: "State is required" };
      err.status = 400
      return next(err)
    }
    updatedGroup.state = state;
  }

  await updatedGroup.save();

  payloadGroup = updatedGroup.toJSON();

  organizer = await User.findByPk(user.id);
  payloadOrganizer = organizer.toJSON();

  return res.json({
    id: payloadGroup.id,
    organizerId: payloadGroup.organizerId,
    name: payloadGroup.name,
    about: payloadGroup.about,
    type: payloadGroup.type,
    private: payloadGroup.private,
    city: payloadGroup.city,
    state: payloadGroup.state,
    createdAt: payloadGroup.createdAt,
    updatedAt: payloadGroup.updatedAt,
    Organizer: payloadOrganizer
  });
})

//delete /api/groups/:groupId
router.delete('/:groupId', requireAuth, async (req, res, next) => {
  const deleteGroup = await Group.findByPk(req.params.groupId);
  const { user } = req;

  if (!deleteGroup) {
    const err = new Error("Group couldn't be found.");
    err.title = "Resource not found";
    err.errors = { message: "Group couldn't be found" };
    err.status = 404;
    return next(err);
  }


  if (deleteGroup.organizerId !== user.id) {
    const err = new Error("Forbidden");
    err.title = "Forbidden";
    err.errors = { messaage: "Forbidden: User is not authorized for the request." };
    err.status = 403
    return next(err)
  }

  await deleteGroup.destroy();

  return res.json({
    message: "Successfully deleted"
  })
})

//get /:groupId/venues
router.get('/:groupId/venues', requireAuth, async (req, res, next) => {
  const { user } = req;
  const findGroup = await Group.findByPk(req.params.groupId)
  if (!findGroup) {
    const err = new Error("Group couldn't be found.");
    err.title = "Resource not found";
    err.errors = { message: "Group couldn't be found" };
    err.status = 404;
    return next(err);
  }


  const findMembership = await Membership.findOne({
    where: {
      userId: user.id,
      groupId: findGroup.id,
    }
  })

  if ((findMembership == null || findMembership.status !== "co-host") && user.id !== findGroup.organizerId) {
    const err = new Error("Forbidden");
    err.title = "Forbidden";
    err.errors = { messaage: "Forbidden: User is not authorized for the request." };
    err.status = 403
    return next(err)
  }

  const allVenues = await Venue.findAll({
    where: {
      groupId: req.params.groupId,
    }
  })

  let sentVenues = [];

  allVenues.forEach(venue => {
    sentVenues.push(venue.toJSON());
  })

  if (sentVenues.length === 0) {
    sentVenues = null;
  }

  return res.json({ Venues: sentVenues });
})

//post /:groupId/venues
router.post('/:groupId/venues', requireAuth, async (req, res, next) => {
  const { user } = req;

  const { address, city, state, lat, lng } = req.body;

  const foundGroup = await Group.findByPk(req.params.groupId);

  const errors = {};
  if (!foundGroup) {
    const err = new Error("Group couldn't be found.");
    err.title = "Resource not found";
    err.errors = { message: "Group couldn't be found" };
    err.status = 404;
    return next(err);
  }

  const findMembership = await Membership.findOne({
    where: {
      userId: user.id,
      groupId: foundGroup.id,
    }
  })

  if ((findMembership == null || findMembership.status !== "co-host") && user.id !== foundGroup.organizerId) {
    const err = new Error("Forbidden");
    err.title = "Forbidden";
    err.errors = { messaage: "Forbidden: User is not authorized for the request." };
    err.status = 403
    return next(err)
  }


  if (!address) {
    const err = new Error("Bad Request.");
    err.title = "Bad Request";
    err.errors = { message: "Street address is required" };
    err.status = 400;
    return next(err);
  }

  if (!city) {
    const err = new Error("Bad Request.");
    err.title = "Bad Request";
    err.errors = { message: "City is required" };
    err.status = 400;
    return next(err);
  }

  if (!state) {
    const err = new Error("Bad Request.");
    err.title = "Bad Request";
    err.errors = { message: "State is required" };
    err.status = 400;
    return next(err);
  }

  if ((lat > 90 || lat < -90) && typeof lat !== "integer") {
    const err = new Error("Bad Request.");
    err.title = "Bad Request";
    err.errors = { message: "Latitude is not valid" };
    err.status = 400;
    return next(err);
  }

  if (lng > 180 || lng < -180 && typeof lng !== "integer") {
    const err = new Error("Bad Request.");
    err.title = "Bad Request";
    err.errors = { message: "Longitude is not valid" };
    err.status = 400;
    return next(err);
  }

  let newVenue = await foundGroup.createVenue({
    groupId: req.params.groupId,
    address: address,
    city: city,
    state: state,
    lat: lat,
    lng: lng
  })

  newVenue = newVenue.toJSON();

  delete newVenue.updatedAt;
  delete newVenue.createdAt;

  return res.json(newVenue);
})

//get /:groupId/events
router.get('/:groupId/events', async (req, res, next) => {
  let findGroup = await Group.findByPk(req.params.groupId);

  if (!findGroup) {
    const err = new Error("Group couldn't be found.");
    err.title = "Resource not found";
    err.errors = { message: "Group couldn't be found" };
    err.status = 404;
    return next(err);
  }

  let foundEvents = await Event.findAll({
    where: {
      groupId: req.params.groupId,
    },
    include: [{
      model: Group,
      attributes: ['id', 'name', 'city', 'state']
    },
    {
      model: Venue,
      attributes: ['id', 'city', 'state']
    }]
  })

  let pushedEvents = [];

  for (let i = 0; i < foundEvents.length; i++) {
    let event = foundEvents[i];
    let attendance = await Attendance.findAll({
      where: {
        eventId: event.id,
        status: "attending",
      },
    })

    event = event.toJSON();
    delete event.createdAt;
    delete event.updatedAt;
    event.numAttending = attendance.length;

    pushedEvents.push({
      id: event.id,
      groupId: event.groupId,
      venueId: event.venueId,
      description: event.description,
      name: event.name,
      type: event.type,
      startDate: event.startDate,
      endDate: event.endDate,
      numAttending: event.numAttending,
      previewImage: event.previewImage,
      Group: event.Group,
      Venue: event.Venue,
    });
  }

  if (pushedEvents.length == 0) {
    pushedEvents = "There are no events right now";
  }

  return res.json({ Events: pushedEvents });
})

//post /:groupId/events
router.post('/:groupId/events', requireAuth, async (req, res, next) => {
  const group = await Group.findByPk(req.params.groupId);
  const { user } = req;

  const groupPayload = group.toJSON();

  const organizer = await User.findByPk(user.id);

  const payloadOrganizer = organizer.toJSON();


  if (!group) {
    const err = new Error("Group couldn't be found.");
    err.title = "Resource not found";
    err.errors = { message: "Group couldn't be found" };
    err.status = 404;
    return next(err);
  }


  const grabMembership = await Membership.findOne({
    where: {
      userId: user.id,
      groupId: req.params.groupId,
    }
  })

  if (!grabMembership) {
    const err = new Error("Forbidden");
    err.title = "Forbidden";
    err.errors = { messaage: "Forbidden: User is not authorized for the request." };
    err.status = 403
    return next(err)
  } else if ((user.id !== group.organizerId && grabMembership.status !== 'co-host')) {
    const err = new Error("Forbidden");
    err.title = "Forbidden";
    err.errors = { messaage: "Forbidden: User is not authorized for the request." };
    err.status = 403
    return next(err)
  }

  const errors = {};
  let { venueId, name, type, capacity, price, description, previewImage, startDate, endDate } = req.body;

  let checkVenue = await Venue.findByPk(venueId);


  if (!checkVenue) {
    venueId = 1;
  }

  if (name.length < 5) {
    const err = new Error("Bad Request");
    err.title = "Bad Request";
    err.errors = { name: "Name must be at least 5 characters" };
    err.status = 400
    return next(err)
  }

  if (type.toLowerCase() !== "online" && type.toLowerCase() !== "in person") {
    const err = new Error("Bad Request");
    err.title = "Bad Request";
    err.errors = { type: "Type must be 'Online' or 'In person" };
    err.status = 400
    return next(err)
  }


  if (typeof capacity !== "number") {
    const err = new Error("Bad Request");
    err.title = "Bad Request";
    err.errors = { capacity: "Capacity must be an integer" };
    err.status = 400
    return next(err)
  }

  if (price < 0 || typeof price !== "number" || price === undefined) {
    const err = new Error("Bad Request");
    err.title = "Bad Request";
    err.errors = { price: "Price is invalid" };
    err.status = 400
    return next(err)
  }

  if (!description) {
    const err = new Error("Bad Request");
    err.title = "Bad Request";
    err.errors = { description: "Description is required" };
    err.status = 400
    return next(err)
  } else if (description.length < 30) {
    const err = new Error("Bad Request");
    err.title = "Bad Request";
    err.errors = { description: "Description must be 30 characters or more!" };
    err.status = 400
    return next(err)
  }

  if (new Date(startDate) <= new Date()) {
    const err = new Error("Bad Request");
    err.title = "Bad Request";
    err.errors = { startDate: "Start date must be in the future" };
    err.status = 400
    return next(err)
  } else if (!startDate) {
    const err = new Error("Bad Request");
    err.title = "Bad Request";
    err.errors = { startDate: "Please input a start date" };
    err.status = 400
    return next(err)
  }

  if (new Date(endDate) < new Date(startDate)) {
    const err = new Error("Bad Request");
    err.title = "Bad Request";
    err.errors = { endDate: "End date is less than start date" };
    err.status = 400
    return next(err)
  } else if (!endDate) {
    const err = new Error("Bad Request");
    err.title = "Bad Request";
    err.errors = { startDate: "Please input an end date" };
    err.status = 400
    return next(err)
  }

  if (!previewImage) {
    const err = new Error("Bad Request");
    err.title = "Bad Request";
    err.errors = { previewImage: "Please Include an Image" };
    err.status = 400
    return next(err)
  } else if ((!previewImage.includes('.jpg') && !previewImage.includes('.jpeg') && !previewImage.includes('.png'))) {
    const err = new Error("Bad Request");
    err.title = "Bad Request";
    err.errors = { previewImage: "Image URL must end in .png, .jpg, or .jpeg" },
      err.status = 400;
    return next(err);
  }


  let newEvent = await group.createEvent({
    venueId: venueId,
    name: name,
    type: type,
    capacity: capacity,
    price: price,
    description: description,
    previewImage: previewImage,
    startDate: startDate,
    endDate: endDate
  })

  let newAttendance = await Attendance.create({
    eventId: newEvent.id,
    userId: user.id,
    status: 'attending'
  })

  newEvent = newEvent.toJSON();
  delete newEvent.createdAt;
  delete newEvent.updatedAt;

  return res.json({
    id: newEvent.id,
    groupId: newEvent.groupId,
    venueId: newEvent.venueId,
    name: newEvent.name,
    type: newEvent.type,
    capacity: newEvent.capacity,
    price: newEvent.price,
    description: newEvent.description,
    previewImage: newEvent.previewImage,
    startDate: newEvent.startDate,
    endDate: newEvent.endDate,
    Group: groupPayload,
    Organizer: payloadOrganizer,
  });
})

//get /:groupId/members
router.get('/:groupId/members', async (req, res, next) => {
  const { user } = req;

  const foundGroup = await Group.findByPk(req.params.groupId);

  if (!foundGroup) {
    const err = new Error("Group couldn't be found.");
    err.title = "Resource not found";
    err.errors = { message: "Group couldn't be found" };
    err.status = 404;
    return next(err);
  }

  const findMembership = await Membership.findOne({
    where: {
      groupId: req.params.groupId,
      userId: user.id,
    }
  });
  const users = await foundGroup.getUsers();
  const sendingUsers = [];

  let cohostCheck = false;

  if (findMembership && findMembership.status == 'co-host') {
    cohostCheck = true;
  }

  if (user.id == foundGroup.organizerId || cohostCheck == true) {
    users.forEach(user => {
      sendingUsers.push(user.toJSON());
    })
  } else {
    users.forEach(user => {
      if (user.Membership.status !== 'pending') {
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

  return res.json({ Members: sendingUsers });
})

//post /:groupId/membership
router.post('/:groupId/membership', requireAuth, async (req, res, next) => {
  const foundGroup = await Group.findByPk(req.params.groupId);
  const { user } = req;
  const { memberId, status } = req.body;
  if (!foundGroup) {
    const err = new Error("Group couldn't be found.");
    err.title = "Resource not found";
    err.errors = { message: "Group couldn't be found" };
    err.status = 404;
    return next(err);
  }

  if (status.toLowerCase() !== 'pending') {
    const err = new Error("Bad Request");
    err.title = "Bad Request";
    err.errors = { message: "Invalid Input" };
    err.status = 403
    return next(err)
  }

  if (memberId !== user.id) {
    const err = new Error("Forbidden");
    err.title = "Forbidden";
    err.errors = { messaage: "Forbidden: Only current user can request memeberships to groups." };
    err.status = 403
    return next(err)
  }

  const checkMembership = await Membership.findOne({
    where: {
      userId: user.id,
      groupId: req.params.groupId
    }
  })

  if (checkMembership) {
    if (checkMembership.status !== 'pending') {
      const err = new Error("Bad Request");
      err.title = "Bad Request";
      err.errors = { message: "User is already a member of the group" };
      err.status = 400
      return next(err)
    } else {
      const err = new Error("Bad Request");
      err.title = "Bad Request";
      err.errors = { message: "Membership has already been requested" };
      err.status = 400
      return next(err)
    }
  }

  let newMember = foundGroup.createMembership({
    groupId: req.params.groupId,
    userId: user.id,
    status: 'pending'
  })

  return res.json({
    memberId: user.id,
    status: 'pending'
  });
})

//put /:groupId/membership
router.put('/:groupId/membership', requireAuth, async (req, res, next) => {
  const { memberId, status } = req.body;
  const { user } = req;
  let checkGroup = await Group.findByPk(req.params.groupId);
  if (!checkGroup) {
    const err = new Error("Group couldn't be found.");
    err.title = "Resource not found";
    err.errors = { message: "Group couldn't be found" };
    err.status = 404;
    return next(err);
  }

  let checkUser = await User.findByPk(memberId)

  if (!checkUser) {
    const err = new Error("Bad Request");
    err.title = "Bad Request";
    err.errors = { message: "User couldn't be found" };
    err.status = 400
    return next(err)
  }

  if (status.toLowerCase() !== 'pending' && status.toLowerCase() !== 'co-host' && status.toLowerCase() !== 'member') {
    const err = new Error("Bad Request");
    err.title = "Bad Request";
    err.errors = { message: "Invalid Input" };
    err.status = 400
    return next(err)
  }



  let foundMembership = await Membership.findOne({
    where: {
      userId: user.id,
      groupId: req.params.groupId
    }
  });

  let changeMembership = await Membership.findOne({
    where: {
      groupId: req.params.groupId,
      userId: memberId,
    }
  });



  if (!foundMembership || (foundMembership.status.toLowerCase() !== 'co-host' && foundMembership.status.toLowerCase() !== 'organizer')) {
    const err = new Error("Bad Request");
    err.title = "Bad Request";
    err.errors = { message: "Current User must already be the organizer or have a membership to the group with the status of co-host" };
    err.status = 400
    return next(err)
  }

  if (!changeMembership) {
    const err = new Error("Bad Request");
    err.title = "Bad Request";
    err.errors = { message: "Membership between the user and the group does not exist" };
    err.status = 400
    return next(err)
  }


  if (status.toLowerCase() == 'pending') {
    const err = new Error("Bad Request");
    err.title = "Bad Request";
    err.errors = { message: "Cannot change a membership to pending" };
    err.status = 400
    return next(err)
  }

  if (status.toLowerCase() == 'member' && changeMembership.status.toLowerCase() == 'pending')
    changeMembership.status = 'member';

  if (status.toLowerCase() == 'member' && changeMembership.status.toLowerCase() == 'co-host') {
    if (user.id == checkGroup.organizerId) {
      changeMembership.status = 'member';
    } else {
      const err = new Error("Forbidden");
      err.title = "Forbidden";
      err.errors = { message: "To demote a co-host user must be organizer" };
      err.status = 403
      return next(err)
    }
  }


  if (status.toLowerCase() == 'co-host') {
    if (user.id == checkGroup.organizerId) {
      changeMembership.status = 'co-host';
    } else {
      const err = new Error("Forbidden");
      err.title = "Forbidden";
      err.errors = { message: "To change to co-host user must be organizer" };
      err.status = 403
      return next(err)
    }
  }


  await changeMembership.save();

  changeMembership = changeMembership.toJSON();
  checkGroup = checkGroup.toJSON();

  return res.json({
    id: changeMembership.id,
    groupId: changeMembership.groupId,
    memberId: changeMembership.userId,
    status: changeMembership.status
  });
})

//delete /:groupId/membership
router.delete('/:groupId/membership', requireAuth, async (req, res, next) => {
  const { memberId } = req.body;
  const { user } = req;
  let checkGroup = await Group.findByPk(req.params.groupId);

  if (!checkGroup) {
    const err = new Error("Group couldn't be found.");
    err.title = "Resource not found";
    err.errors = { message: "Group couldn't be found" };
    err.status = 404;
    return next(err);
  }

  let checkUser = await User.findByPk(memberId);

  if (!checkUser) {
    const err = new Error("Bad Request");
    err.title = "Bad Request";
    err.errors = { message: "User couldn't be found" };
    err.status = 400
    return next(err)
  }

  let checkMembership = await Membership.findOne({
    where: {
      userId: user.id,
      groupId: req.params.groupId,
    }
  });


  if ((!checkMembership || checkMembership.status !== "organizer") && user.id !== memberId) {
    const err = new Error("Forbidden");
    err.title = "Forbidden";
    err.errors = { message: "User is not authorized" };
    err.status = 403
    return next(err)
  }

  let foundMembership = await Membership.findOne({
    where: {
      userId: memberId,
      groupId: req.params.groupId
    }
  })


  if (!foundMembership) {
    const err = new Error("Bad Request");
    err.title = "Bad Request";
    err.errors = { message: "Membership between the user and the group does not exist" };
    err.status = 400
    return next(err)
  }

  let events = await Event.findAll({
    where: {
      groupId: req.params.groupId,
    }
  })

  for (let i = 0; i < events.length; i++) {
    let event = events[i];
    let grabAttendance = await Attendance.findOne({
      where: {
        userId: memberId,
        eventId: event.id,
      }
    })
    if (grabAttendance) {
      await grabAttendance.destroy();
    }
  }
  await foundMembership.destroy();

  return res.json({
    message: "Successfully deleted membership from group"
  })
})


module.exports = router;
