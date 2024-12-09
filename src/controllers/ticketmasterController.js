const axios = require("axios");

const apiKey = process.env.TICKETMASTER_API_KEY;
// const apiKey2 = "Gop2hzx6q7EoGa1BTzateRWmIJqGxeUz";
console.log({ apiKey });

exports.searchEvents = async (req, res) => {
  const { city, stateCode, startDateTime, endDateTime } = req.params;

  // Validation: Only check for required fields
  if (!city || !stateCode) {
    return res.status(400).json({
      error: "City and stateCode are required parameters",
    });
  }

  // Build base URL with required parameters
  let url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${apiKey}&city=${city}&stateCode=${stateCode}`;

  // Add dates if provided, format with Z time
  if (startDateTime) {
    console.log({ startDateTime });
    const formattedStart = `${startDateTime}T00:00:00Z`;
    url += `&startDateTime=${formattedStart}`;
  }
  if (endDateTime) {
    console.log({ endDateTime });
    const formattedEnd = `${endDateTime}T00:00:00Z`;
    url += `&endDateTime=${formattedEnd}`;
  }

  try {
    console.log(url);
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching events" + url });
  }
};
