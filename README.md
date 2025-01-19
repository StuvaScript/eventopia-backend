# Back-End Repo for Node/React Practicum

This will be the API for the front-end React app part of your practicum project.

These instructions are for the **front-end team** so they can setup their local development environment to run
both the back-end server and their front-end app. You can go through these steps during your first group meeting
in case you need assistance from your mentors.

> The back-end server will be running on port 8000. The front-end app will be running on port 3000. You will need to run both the back-end server and the front-end app at the same time to test your app.

### Setting up local development environment

1. Create a folder to contain both the front-end and back-end repos
2. Clone this repository to that folder
3. Run `npm install` to install dependencies
4. Pull the latest version of the `main` branch (when needed)
5. Run `npm run dev` to start the development server
6. Open http://localhost:8000/api/v1/ with your browser to test.
7. Your back-end server is now running. You can now run the front-end app.

#### Running the back-end server in Visual Studio Code

Note: In the below example, the group's front-end repository was named `bb-practicum-team1-front` and the back-end repository was named `bb-practicum-team-1-back`. Your repository will have a different name, but the rest should look the same.
![vsc running](images/back-end-running-vsc.png)

#### Testing the back-end server API in the browser

![browser server](images/back-end-running-browser.png)

> Update the .node-version file to match the version of Node.js the **team** is using. This is used by Render.com to [deploy the app](https://render.com/docs/node-version).

### API Endpoints Summary

#### User Routes

1. Register

   - Method: POST
   - URL: http://localhost:8000/api/v1/user/register
   - JSON Request Body:

   ```json
   {
     "firstName": "Amanda",
     "lastName": "Hockmuth",
     "email": "example@gmail.com",
     "password": "Password129",
     "city": "New York",
     "state": "NY"
   }
   ```

2. Login

   - Method: POST
   - URL: http://localhost:8000/api/v1/user/login
   - JSON Request Body:

   ```json
   {
     "email": "example@gmail.com",
     "password": "Password129"
   }
   ```

#### Itinerary Routes:

1. Get All Itinerary:
   - Method: GET
   - URL: http://localhost:8000/api/v1/itinerary/
   - Requires: Authentication token
2. Get Single Itinerary
   - Method: GET
   - URL: http://localhost:8000/api/v1/itinerary/:<id>
   - Requires: Authentication token
3. Create Itinerary

   - Method: POST
   - URL: http://localhost:8000/api/v1/itinerary/
   - Requires: Authentication token
   - JSON Request Body:

   ```json
   {
     "ticketmasterId": "vvG1HZbFH8sU0m",
     "name": "Event Name",
     "startDateTime": "2024-12-22T13:05:00",
     "venue": {
       "name": "Venue Name",
       "address": "800 Main St",
       "city": "Seattle",
       "state": "Washington",
       "postalCode": "98101",
       "coordinates": {
         "lat": 47.595083,
         "lng": -122.331607
       }
     },
     "url": "https://www.ticketmaster.com/event/123",
     "imageURL": "https://example.com/image.jpg",
     "info": "Event description",
     "user": "675bb5d8277e1a64f2033539"
   }
   ```

4. Update Itinerary

   - Method: PATCH
   - URL: http://localhost:8000/api/v1/itinerary/:<id>
   - Requires: Authentication token
   - JSON Request Body:

   ```json
   {
     "ticketmasterId": "vvG1HZbFH8sU0m",
     "name": "Event Name",
     "startDateTime": "2024-12-22T13:05:00",
     "venue": {
       "name": "Venue Name",
       "address": "800 Main St",
       "city": "Seattle",
       "state": "Washington",
       "postalCode": "98101",
       "coordinates": {
         "lat": 47.595083,
         "lng": -122.331607
       }
     },
     "url": "https://www.ticketmaster.com/event/123",
     "imageURL": "https://example.com/image.jpg",
     "info": "Event description",
     "user": "675bb5d8277e1a64f2033539"
   }
   ```

5. Delete Itinerary
   - Method: DELETE
   - URL: http://localhost:8000/api/v1/itinerary/:<id>
   - Requires: Authentication token

#### Events Search Route

- Method: GET
- URL: http://localhost:8000/api/ticketmaster/events/:city/:stateCode

- Parameters:

  - city (required): Name of city
  - stateCode (required): Two-letter state code
  - dateRangeStart (optional): YYYY-MM-DDTHH:MM:SS format
  - dateRangeEnd (optional): YYYY-MM-DDTHH:MM:SS format

- Example Request:

  - `/api/ticketmaster/events/CityName/TwoLetterStateCode?dateRangeStart=YYYY-MM-DDTHH:MM:SSZ&dateRangeEnd=YYYY-MM-DDTHH:MM:SSZ&keyword=keyword`
  - `/api/ticketmaster/events/Seattle/WA?dateRangeStart=2025-02-01T00:00:00Z&dateRangeEnd=2025-02-28T00:00:00Z&keyword=sports`

- Example JSON Response:
  ```json
  {
  name: "UFC Fight Night",
  dates: {
     startDate: "2025-02-22",
     startTime: "15:00:00"
  },
  ticketmasterId: "vvG1HZb_53UoGH",
  url: "https://www.ticketmaster.com/ufc-fight-night-seattle-washington-02-22-2025/event/0F006192D2D9133C",
  info: "Please visit our website to view the Arena Guide with Bag Policy and Prohibited Items list.",
  images: [
     "https://s1.ticketm.net/dam/a/138/09f8507b-e5bd-400f-8363-8c3b83e82138_RECOMENDATION_16_9.jpg",
     "https://s1.ticketm.net/dam/a/138/09f8507b-e5bd-400f-8363-8c3b83e82138_SOURCE"
  ],
  venue: {
     name: "Climate Pledge Arena",
     address: "334 1st Ave N",
     city: "Seattle",
     state: "Washington",
     lat: "47.6221261",
     lon: "-122.35401604"
  },
  classification: "Sports"
  },
  ```

#### Event Sharing Route

1. Share Event

   - Method: POST
   - URL: http://localhost:8000/api/email/share-event
   - JSON Request Body:

   ```json
   {
     "recipientEmail": "friend@example.com",
     "userName": "Jane Doe",
     "eventDetails": {
       "name": "Concert Event",
       "startDateTime": "2024-12-22T13:05:00",
       "venue": {
         "name": "Concert Hall",
         "address": "123 Music Ave",
         "city": "Seattle",
         "state": "Washington"
       },
       "info": "Amazing concert event description"
     }
   }
   ```
