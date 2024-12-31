const express = require("express");
const router = express.Router();
const auth = require("../middleware/authentication");

const {
  getAllItineraryItems,
  getSingleItineraryItem,
  createItineraryItem,
  updateItineraryItem,
  deleteItineraryItem,
} = require("../controllers/itineraryItem");

router.get("/", auth, getAllItineraryItems);
router.get("/:id", auth, getSingleItineraryItem);
router.post("/", auth, createItineraryItem);
router.patch("/:id", auth, updateItineraryItem);
router.delete("/:id", auth, deleteItineraryItem);

module.exports = router;
