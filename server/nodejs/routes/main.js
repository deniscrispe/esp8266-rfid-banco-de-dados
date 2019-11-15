const express = require('express')
  , router = express.Router()
  , config = require('../config/config');

/* endpoints */
router.get('/', (req, res) => {
  res.json({
    'endpoints': config.api.endpoints
  })
});

/* user routes */
router.use('/users', require('./users/route'));

/* tag routes */
router.use('/tags', require('./tags/route'));

/* log routes */
router.use('/logs', require('./logs/route'));

/* classroom routes */
router.use('/classrooms', require('./classrooms/route'))

module.exports = router;
