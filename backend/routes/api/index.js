const router = require('express').Router();
const sessionRouter = require('./session.js');
const usersRouter = require('./users.js');
const groupsRouter = require('./groups.js');
const eventsRouter = require('./events.js');
const venuesRouter = require('./venues.js');
const groupImagesRouter = require('./group-image.js');
const eventImagesRouter = require('./event-image.js');
const { restoreUser } = require('../../utils/auth.js');
//all routers will go to here

router.use(restoreUser);

router.use('/session', sessionRouter);

router.use('/users', usersRouter);

router.use('/groups', groupsRouter);

router.use('/events', eventsRouter);

router.use('/venues', venuesRouter);

router.use('/group-images', groupImagesRouter);

router.use('/event-images', eventImagesRouter);

router.post('/test', (req, res) => {
  res.json({ requestBody: req.body });
});


module.exports = router;
