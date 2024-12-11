const express = require('express')
const router = express.Router();
const auth = require('../middleware/authentication');


const {
    getAllItineraryItems,
    getSingleItineraryItem,
    createItineraryItem,
    updateItineraryItem,
    deleteItineraryItem
} = require('../controllers/itineraryItem');

router.use(auth);
router.route('/').get(getAllItineraryItems).post(createItineraryItem);

router.route('/:id')
    .get(getSingleItineraryItem)
    .put(updateItineraryItem)
    .delete(deleteItineraryItem);


module.exports = router
