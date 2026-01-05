const express = require('express');
const router = express.Router();
const { viewSticker, viewPackingList } = require('../controllers/containerController');

// POST /container/viewsticker
router.post('/viewsticker', viewSticker);

// POST /container/viewpackinglist
router.post('/viewpackinglist', viewPackingList);

module.exports = router;
