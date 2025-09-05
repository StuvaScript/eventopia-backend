const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

// API key from .env file
const apiKey = process.env.TICKETMASTER_API_KEY;

exports.searchEvents = async (req, res) => {
  const { city, stateCode } = req.params;
  const { dateRangeStart, dateRangeEnd, keyword } = req.query;

  // Validation: Only check for required fields
  if (!city || !stateCode) {
    return res.status(400).json({
      error: "City and stateCode are required parameters",
    });
  }

  // Build base URL with required parameters
  let url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${apiKey}&city=${city}&stateCode=${stateCode}`;

  // Build safe date params
  const now = new Date();
  const safeStart =
    dateRangeStart && dateRangeStart !== "Z"
      ? new Date(dateRangeStart).toISOString().split(".")[0] + "Z" // strip milliseconds
      : new Date(now.setHours(0, 0, 0, 0)).toISOString().split(".")[0] + "Z";

  const safeEnd =
    dateRangeEnd && dateRangeEnd !== "Z"
      ? new Date(dateRangeEnd).toISOString().split(".")[0] + "Z"
      : new Date(new Date().setDate(new Date().getDate() + 14))
          .toISOString()
          .split(".")[0] + "Z";

  // Add dates if provided
  if (safeStart) url += `&startDateTime=${safeStart}`;
  if (safeEnd) url += `&endDateTime=${safeEnd}`;

  if (keyword) {
    url += `&keyword=${keyword}`;
  }

  try {
    const response = await axios.get(url);

    // Check for presence of events in response data
    if (!response.data._embedded?.events) {
      res.json({ message: "No Events Returned" });
    } else {
      // Format the response data
      const formattedEvents = response.data._embedded?.events.map((event) => ({
        name: event.name,
        dates: {
          startDate: event.dates.start.localDate,
          startTime: event.dates?.start?.localTime,
          endDate: event.dates?.end?.localDate,
          endTime: event.dates?.end?.localTime,
        },
        ticketmasterId: event.id,
        url: event?.url,
        info: event?.info,
        images: event.images?.map((image) => image.url),
        venue: {
          name: event._embedded.venues[0].name,
          address: event._embedded.venues[0].address?.line1,
          city: event._embedded.venues[0].city.name,
          state: event._embedded.venues[0].state.name,
          lat: event._embedded.venues[0].location?.latitude,
          lon: event._embedded.venues[0].location?.longitude,
        },
        classification: event.classifications?.[0]?.primary
          ? event.classifications[0].segment.name
          : "",
      }));
      res.json(formattedEvents);
    }
  } catch (error) {
    if (error.response) {
      console.error("Ticketmaster API Error:", {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url,
      });
      return res.status(error.response.status).json({
        error: error.response.data,
        url,
      });
    } else {
      console.error("Unexpected Error:", error.message);
      return res.status(500).json({ error: error.message, url });
    }
  }
};
