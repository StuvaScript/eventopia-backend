const axios = require("axios");

const apiKey = process.env.TICKETMASTER_API_KEY;

exports.searchEvents = async (req, res) => {
  const { city, stateCode, startDateTime, endDateTime } = req.params;

  if (!city || !stateCode || !startDateTime || !endDateTime) {
    return res.status(400).json({
      error:
        "All parameters are required: city, stateCode, startDateTime, endDateTime",
    });
  }

  const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${apiKey}&city=${city}&stateCode=${stateCode}&startDateTime=${startDateTime}&endDateTime=${endDateTime}`;

  try {
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching events" });
  }
};
