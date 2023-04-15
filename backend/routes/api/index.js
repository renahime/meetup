const router = require('express').Router();
//all routers will go to here

router.post('/test', function(req, res) {
  res.json({ requestBody: req.body });
});


module.exports = router;
