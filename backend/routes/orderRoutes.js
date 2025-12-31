const express = require('express');
const router = express.Router();
const { getOrderListByDate, getOrderListByDeliveryDate, getPendingOrders, getPendingSubOrders, getCurrentMonthSummary, getDateWiseSummary, getPlywoodDailyOperationsSummary, executeStoredProcedure } = require('../controllers/orderController');

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

// POST /order/plywooddailyoperationssummary
router.post('/plywooddailyoperationssummary', getPlywoodDailyOperationsSummary);

// POST /order/execute - Generic stored procedure execution
router.post('/execute', executeStoredProcedure);

module.exports = router;
