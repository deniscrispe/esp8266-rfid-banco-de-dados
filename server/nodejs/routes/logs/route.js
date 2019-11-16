const express = require('express')
  , router = express.Router()
  , controller = require('./controller');

router
  .post('/filtro/', controller.filtro)
  .get('/', controller.index)
  .get('/:id', controller.show)
  .post('/', controller.create)
  .put('/:id', controller.update)
  .delete('/:id', controller.remove);

module.exports = router;
