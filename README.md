# messenger-app-backend

The backend server of my instant messaging app.
- It is built on the express.js framework to handle requests.
- JWT (jsonwebtoken) is used to create sessions and ensure that only authorised users can access the `/auth/*` endpoints.
- [socket.io](socket.io) is used to provide instant updates to the frontend when backend changes occur.
- Postgres is used as the backend datastore.
## Installation
**Prerequisites:** Node.js, npm
1. Clone repo to your local machine.
2. Run `npm i` to install package dependecies.
3. Create `.env` file at the root of the repo. This needs to contain `SECRET`, `JWT-SECRET` and `CONNECTION_STRING`.
4. Run `npm start` to start the server.
