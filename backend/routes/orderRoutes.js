const express = require('express');
const router = express.Router();
const { getOrderListByDate, getOrderListByDeliveryDate, getPendingOrders, getPendingSubOrders, getCurrentMonthSummary, getDateWiseSummary } = require('../controllers/orderController');

// POST /order/listbydate
router.post('/listbydate', getOrderListByDate);

// POST /order/listbydeliverydate
router.post('/listbydeliverydate', getOrderListByDeliveryDate);

// GET /order/pending
router.get('/pending', getPendingOrders);

// GET /order/pendingsuborders
router.get('/pendingsuborders', getPendingSubOrders);

// GET /order/currentmonthsummary
router.get('/currentmonthsummary', getCurrentMonthSummary);

// POST /order/datewisesummary
router.post('/datewisesummary', getDateWiseSummary);

module.exports = router;
