# Brighton Fighting Game Community - API

Brighton Fighting Game Community Website and Resource API

[hbk.gg](https://hbk.gg)

[api.hbk.gg](https://api.hbk.gg)

## About

This repository is the API or server-side of the Brighton Fighting Game Community website and resource. It handles requests from the front-end and other services.

You can probably also use this repository for your own community to handle the back-end, though this is heavily tailored to specific things we use it for here.

Everything is detailed below, as well as a setup guide to get you started on setting this up for development or production.

Unfortunately it's also heavily tied to the [client](https://github.com/coldlink/brighton-fgc-client) it might as well be a monolithic app. So you should set up that as well. I've been meaning to properly separate them out, but it's going to take a while.

## Issues

Report issues here or contact me via [email](mailto:maheshmakani@mkn.sh) or [Twitter](https://twitter.com/coldlink_).

## Setting Up

### Technologies/Services

We rely on very specific services and connections, so you'll need accounts or setups of all of the below to set up:

-  [Challonge](https://challonge.com/)
- We use the Challonge application to run our tournaments, and therefore rely on their API heavily to get all of the information. It's free. You'll need admin access to any tournaments you want to include, otherwise everything breaks.

-  [Cloudinary](https://cloudinary.com)
- Cloudinary is used as the cloud storage application for hosting images, and dynamically storing player avatars for example. I should probably remove this as a dependency, but we rely on it at the moment. Free version is what we use, haven't used anywhere near the limits yet.

-  [Auth0](https://auth0.com/)
- Makes user management easy compared to writing your our authentication and authorisation layer. So this dependency is not going away soon. Also free version should be good, we haven't got anywhere near the limits yet. Check out the "Auth0 Setup Guide" below on getting this set up, as it was a bit of a pain.

-  [Node.js](https://nodejs.org/en/)
- It's our server and run-time environment. Everything runs on here. LTS versions should be good (v8 or v10 at time of writing). No Node, no server, no fun.

-  [MongoDB](https://www.mongodb.com/)
- The database we use to store everything. Community version is good for development, or set up a free hosted version on the MongoDB website which also works well.

### Getting Started

Once you have all the about signed up to and installed, we're good to set everything up! Just follow along, or skip ahead if you're confident.

Clone somewhere good:

```sh
$ git clone https://github.com/coldlink/brighton-fgc-api.git #https
$ #or
$ git clone git@github.com:coldlink/brighton-fgc-api.git #ssh
```

Change directory:
```sh
$ cd brighton-fgc-api
```

Install the dependencies (I use yarn, but npm also works):

```sh
$ yarn #if using yarn
$ #or
$ npm install #if using npm
```

Next we set up the Environment Variables, copy the `.env.example` file into a `.env` file. If you're working on the Brighton FGC site, and I **trust you**, I'll probably just send you my `.env` file to use for development.

Here's an explanation of the variables you will need:

-  `MONGODB_URI` - URI of the MongoDB database, remember to include all auth stuff in the URI string too.

-  `CHALLONGE_API_KEY` - Used to connect to the Challonge API, get this from the [developer settings](https://challonge.com/settings/developer) page.

-  `CHALLONGE_TEST_URL` - URL of a challonge bracket that you have admin access to. Used in testing. As an example: [https://hbk.challonge.com/2k18week21](https://hbk.challonge.com/2k18week21)

-  `CLOUDINARY_NAME` - The "Cloud Name" parameter under "Account Details" when logged into Cloudinary.

-  `CLOUDINARY_API_KEY` - The API key for Cloudinary, also found under "Account Details".

-  `CLOUDINARY_SECRET` - The Secret key for Cloudinary, also found under "Account Details".

-  `AUTH0_CLIENT_ID` - The "Client ID" of the application you made in Auth0. Found under "Application Settings". See the "Auth0 Setup Guide" below on setting Auth0 up, as it's a bit of a pain.

-  `AUTH0_DOMAIN` - The "Domain" of the application you made in Auth0. Found under "Application Settings". See the "Auth0 Setup Guide" below.

-  `AUTH0_API_AUDIENCE` - The "API Audience" of the API you made in Auth0. See the "Auth0 Setup Guide".

-  `NODE_ENV` - You'll need to set this to `production` if you're deploying to a production environment. Otherwise it defaults to `development`.

-  `PORT` - You may need to set this in some environments if it isn't automatically set up already. Defaults to 9000 for development.

### Commands

`yarn dev` or `npm run dev` - Starts the development server locally. Also runs `--inspect` so you can use your favourite debugger. You can start debugging straight away using Visual Studio Code by running the "Start Debugging - F5" command.

`yarn test` or `npm run test` - Runs all the unit tests.

`yarn build` or `npm run build` - Builds a production version of the server ready to be deployed.

`yarn start` or `npm start` - Builds a production version of the server, and starts the production server.

### Auth0 Setup Guide

As mentioned we use Auth0 to manage authentication stuff as it's much better than writing it ourselves. However it can be a bit of a pain to set up, so hopefully this will help.

1. Make sure you have an Auth0 account. Log in and go to the [dashboard](https://manage.auth0.com/#/).

2. We'll need to set up 2 things, an "Application" and an "API". Click on [Applications](https://manage.auth0.com/#/applications).

3. Click "Create Application" to set up a new Application. Give it a name, and select "Single Page Web App". Then click "Create". We use "Single Page Web App" as in our case all of the login stuff happens client site, and we pass a JWT to this API to handle any routes which require auth.

4. Go to the newly created applications "Settings" and make a note of the "Domain" and "Client ID" as you need then for the environment variables.

5. While you're here you should set the "Allowed Callback URLs", these are the login callback routes used when logging in. This is set to the client side, so for local development we use `http://localhost:3000/login`. We also have set `https://hbk.gg/login` in our case, as that's the equivalent route on the production client side, however this should be set to your domain if you have one.

6. You can also set the description and logo here, but it's not required.

7. Next go to [APIs](https://manage.auth0.com/#/apis).

8. Create a new API. Give it a name, and then an identifier. Usually the API endpoint URL, but can be anything, and doesn't need to be publicly available either. It cannot be modified later. The signing algorithm we use is RS256.

9. Once created, make a note of the "API Audience" and set this to the corresponding API variable.

10. Next we have some custom rules set up. So go to [Rules](https://manage.auth0.com/#/rules).

11. Create Rule -> Create empty rule

12. Give it the name "Set roles to user" and the following code:

```js

function (user, context, callback) {
user.app_metadata  =  user.app_metadata  || {};
var  addRolesToUser  =  function(user, cb) {
if (!user.app_metadata.roles) {
cb(null, ['user']);
} else {
cb(null, user.app_metadata.roles);
}
};
  

addRolesToUser(user, function(err, roles) {
if (err) {
callback(err);
} else {
user.app_metadata.roles  =  roles;
auth0.users.updateAppMetadata(user.user_id, user.app_metadata)
.then(function(){
context.idToken[auth0.baseUrl  +  '/roles'] =  user.app_metadata.roles;
callback(null, user, context);
})
.catch(function(err){
callback(err);
});
}
});
}

```

By default, this gives the user the role of `user`. You can give the user the role of `admin` by going to [Users](https://manage.auth0.com/#/users) in Auth0, finding the user you want to make admin and setting their `app_metadata` to something similar like:

```json

{
"roles": [
"user",
"admin"
],
"emailHash": "EMAILHASH"
}
```

This will give them admin privileges next time they log in to the site. You should set this for yourself after you've logged into the application for the first time.

13. Make another rule with name "Add email hash to app metadata" and the following code:

```js
function (user, context, callback) {
user.app_metadata  =  user.app_metadata  || {};
user.app_metadata.emailHash  =  user.email  ?  require('crypto').createHash('md5').update(user.email).digest("hex") :  '' ;
context.idToken[auth0.baseUrl  +  '/emailHash'] =  user.app_metadata.emailHash;

auth0.users.updateAppMetadata(user.user_id, user.app_metadata)
.then(function(){
callback(null, user, context);
})
.catch(function(err){
callback(err);
});
}
```

This sets an md5 hash of the users email which we use to compare to a users email hash we get from Challonge. This allows a user when logging in to automatically get access to their player profile if they use the same email with Auth0 and Challonge when logging in.

14. We also have the "Link Accounts with Same Email Address while Merging Metadata" rule set, which is one of the automatic ones.

15. You can easily set up [social login connections](https://manage.auth0.com/#/connections/social) through Auth0 as well, for example we use the Google login option. In all cases you'll want access to the users email.

16. Hopefully with all that Auth0 should all be set up. I've probably missed a step so if you have any auth issues in the future let me know!

## Adding Data

At this point you're ready to start development. However the database is lacking in data to use. The easiest way to add data is through the admin interface on the client side, so if you've set up the client and an admin user you're good to go. I've been meaning to test out server side auth, but for now you need to log in using the client and use the JWT token from there.

I'll update this once I've implemented a better way for server side authentication.

If you're using the `.env` file I sent you, then data is already available in the dev db to play around with.

## Folder Structure

```
- brighton-fgc-api
  - src
    - api # main api folder, holds all controllers + routes + tests
      - v1 # v1 for now, can be expanded in future
        - character # character model + controller + routes + test
        - elo # elo model + controller + routes + test
        - event # event model + controller + routes + test
        - game # game model + controller + routes + test
        - match # match model + controller + routes + test
        - player # player model + controller + routes + test
        - result # result model + controller + routes + test
        - series # series model + controller + routes + test (deprecated/no longer used since elo)
        - tournament # tournament model + controller + routes + test
    - services # any reusable services
      - auth # useful authorisation methods
      - auth0 # auth0 connection
      - express # expressjs configuration
      - jwt # jwt helper functions
      - mongoose # mongoose configuration
      - response # helpful response methods
    app.js # main app file
    config.js # main configuration file
    index.js # entry file
  - test
    setup.js # set up file for running tests
```

## Models

### Models Map

Hopefully this is an easier way of understanding the relationship between how the models are connected. The arrow shows the direction of where the "public keys" go to. For example the "Character" model has a "public key" for the "Game" model as a character appears in a specific game.

Unfortunatley this does not always model correctly, so you might have to view in plaintext:

|  |  |  |  |  |  |  |
|--|--|--|--|--|--|--|
|→|→|Character|
|↑ |  |↓ |  |  |
|↑ |  |Match|←|←|←|
|↑ |  |↑|            |  |↑|
|Game|→|Tourn-|-ament|←|Pla-|-yer
|↓|     |↑|      ↓|    |↑|↓
|↓|     |Event|Result|→|↑|↓
|→|→|→|Elo|←|←|←


### Models Explanation

#### Character
The character model is a single character from a specific game.

#### Elo
The current elo ranking and number of matches ranked for a specified player and game.

#### Event
An "event" is a single event that happens which has a name, date, venue, and possible url for information about the event. For example "Habrewken #100" was a single event. An event can contain multiple tournaments.

#### Game
A single video game. Usually a fighting game. 

#### Match
A single match between 2 players in a game and a tournament. May also have info on characters used, as well as links to YouTube video or timestamp.

#### Player
A single player. May take part in tournaments. Has info on their Challonge profile if they have an account.

#### Result
Final result for a player in a tournament. Also has their elo rating before and after the tournament.

#### Tournament
A single tournament for a game. Can be part of an event. Also holds a  list of players, as well as other meta information, such as the Challonge page for the tournament.
  
## Coming Soon or Things That Need Working On
- Duplicate players
	- Sometimes players are duplicated for some reason, usually because they signed up not using a challonge account.
	- Need to have better checks to make sure that players are correctly assigned when a tournament is updated.
- Duplicate Characters
	- Some characters have been duplicated, usually because of unintentional mispelling of the characters name.
	- A script to find and solve this issue would be good.
- Reducing reliance on Cloudinary for player avatars.
	- Possible link directly to the avatar as returned from challonge?
	- Fall back to gravatar using email hash?
- Reducing reliance on Challonge, or ability to use other bracket services?
	- Smash.gg? https://www.burningmeter.com/?
- Properly defined Public API to get information
	- API is currently public, but poorly documented
	- Also some routes are for Admin purposes (challonge update, POST, PUT, DELETE etc) which exist alongside public routes (although there is authorization checks).
- Auth0 Machine to Machine implementation.
	- This may already work, just haven't properly checked it.
