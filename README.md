### Intro

This project is providing backend for character customization of the game [Rambo.li](http://rambo.li).

There are 2 consumers of this backend:

1. Character customization client: Users customize their characters with this UI.
2. Game client: Game client gets the customizations for characters to show them as they
   are designed by users.

Main tech used:
- Node
- Express
- Canvas (headless)
- MongoDB via Mongoose
- Testing: Mocha, Chai, Mockery

We use Docker to distribute(through a private Docker registry) and run this application.

Here is a short video about the game

[![video](http://img.youtube.com/vi/-jn-wfxllyo/0.jpg)](http://www.youtube.com/watch?v=-jn-wfxllyo)

### Technique

This backend provides stores character customization configurations as well
as the masks (PNG images) of them.

Configuration done by client is saved on the database.
Configuration is drawn on a headless canvas (actually one for each 2 masks) and
the resulting PNG image is also saved on Mongo database.

Those images will be served to game clients.

We don't generate images on demand since it is a very expensive operation and
changing the customization occurs much much infrequent than getting the masks.

Facebook login is the only authentication mechanism. However once you're logged
in, Facebook token is not required anymore since you're provided a custom access token.

That custom access token is a JWT token. Thus this backend is completely stateless
and unconnected to any other systems. Clients should fetch the signed tokens and
pass them around.

However, we don't want to pass that custom access token to be passed around to other systems.
As a link from character customization backend to game websocket backend, we have the game tokens.

Game token is a token that needs to be passed to game websocket backend to prove
that you're the user you claim to be. This is necessary since we don't have any link
between the game websocket backend and the character customization backend.
The reason that we need another token type is we don't want to pass around the
access token. Game websocket backend is not SSL encrypted. We don't care if a game
token is stolen: it is only valid for 30 seconds.

### Technical show off

- ES6 features are used in the code, so that's why we need Node 4.x.
- Pretty much everything is promisified.
- Tests are in the `test/` directory and all API calls have integration tests.
- Some services which depend on 3rd party webservices have mock tests.
- Headless canvas works awesome.
- Currently this application is deployed on a private staging system in a Docker container.
- Completely stateless as JWT is used. No need for sticky sessions.


### API

CORS is enabled for all domains.


##### /api/v1/public/loginWithFacebook

Example:

    POST /api/v1/public/loginWithFacebook
    PAYLOAD
        {
            fb_access_token: ABCDEF
        }
    RESPONSE
        STATUS: 200
        {
            token: JWT_TOKEN_LIKE_eyJhbGciOiJIU...,
            expires: 123456789,
            userId: a283f123d921
        }

`fb_access_token`: Short living token that is received using Facebook Javascript API by the client.

Returns status 401 in case of any error.


##### /api/v1/public/masks/:id

Returns the masks for user with given id.

Doesn't require authentication because a player should see other players' customized characters as well.

Example:

    GET /api/v1/public/masks/a5d1f73738
    RESPONSE
        STATUS: 200
        {
            mask0: "data:image/png;base64,iVBORw0KGgoAA...==",
            mask1: "data:image/png;base64,iVBORw0KGgoBB...=="
        }

Returns 500 in case of any error.

Returned masks are to be used by game clients in conjunction with the animation layer.
That means, for a player:

- Draw mask0
- Draw animation layer
- Draw mask1


##### /api/v1/auth/charCustomization

REST resource for the character customization of a user.

Requires authentication.

Read example:

    GET /api/v1/auth/charCustomization
    HEADERS
        x-access-token: JWT_TOKEN_LIKE_eyJhbGciOiJIU...
    RESPONSE
        STATUS: 200
        [
            {"optionId":"1000","color":"#0080FF"},
            {"optionId":"2016","color":"#FF0000"},
            {"optionId":"3005","color":"#0000FF"},
            {"optionId":"4004"},
            {"optionId":"5010","color":"#FF0000"}
        ]

If user doesn't have character customization data saved already, we return a random one from
the predefined customizations. This helps user to start with some handcrafted customization instead
of a completely empty character.

Returns 401 in case of authentication problems and 500 in case of any other errors.

Update/create example:

    POST /api/v1/auth/charCustomization
    HEADERS
        x-access-token: JWT_TOKEN_LIKE_eyJhbGciOiJIU...
    PAYLOAD
        [
            {"optionId":"1000","color":"#0080FF"},
            {"optionId":"2016","color":"#FF0000"},
            {"optionId":"3005","color":"#0000FF"},
            {"optionId":"4004"},
            {"optionId":"5010","color":"#FF0000"}
        ]
    RESPONSE
        STATUS: 200
        {
            "OK": 1
        }

We don't use PUT for update and POST for create. We just use POST for both since client doesn't know
if there is character customization already or not. This is because we return a predefined character
customization in case there is no character customization already for the user.


##### /api/v1/auth/charCustomization/random

This returns a random character customization out of the predefined ones.
This is useful to show user different possibilities and encourage him/her to customize the character.

Requires authentication.

Example:

    GET /api/v1/auth/charParts/random
    HEADERS
        x-access-token: JWT_TOKEN_LIKE_eyJhbGciOiJIU...
    RESPONSE
        STATUS:200
        [
            {"optionId":"1000","color":"#0080FF"},
            {"optionId":"2016","color":"#FF0000"},
            {"optionId":"3005","color":"#0000FF"},
            {"optionId":"4004"},
            {"optionId":"5010","color":"#FF0000"}
        ]

Returns 401 in case of authentication problems and 500 in case of any other errors.


##### /api/v1/auth/gameToken

Returns a *game token*. Game tokens are used to identify someone.
This is an architectural decision involving many factors like (SSL, performance, websockets, Facebook, etc.)
so, I am not going to go into details here.

Clients get a game token and pass it to game websocket backend to claim that they're some person.

Requires authentication.

Example:

    GET /api/v1/auth/gameToken
    HEADERS
        x-access-token: JWT_TOKEN_LIKE_eyJhbGciOiJIU...
    RESPONSE
        STATUS:200
        {
            token: JWT_GAME_TOKEN_LIKE_eyJhbGciOiJIU...,
            expires: 1278954112459
        }


Returns 401 in case of authentication problems and 500 in case of any other errors.

### Development environment setup

Install OS-level dependencies.
These are MongoDB and Cairo.

MongoDB is used as the database to store user information.
Cairo is used for having a Canvas in Node environment.

OSX instructions:

    brew install mongo
    # do following or
    # see https://github.com/Automattic/node-canvas/wiki/_pages
    # and https://github.com/Automattic/node-canvas/issues/348
    xcode-select --install
    brew install cairo gobject-introspection pixman jpeg libjpeg

    # install Node dependencies
    npm install

### Run devl
Start your MongoDB first and create a database called `catalli-cc`.

    mongo
    >$ use catalli-cc

Then start the app:

    CATALLI_ACCESS_TOKEN_SECRET=<SOME SECRET TO SIGN JWT ACCESS TOKENS>
    CATALLI_GAME_TOKEN_SECRET=<SOME SECRET TO SIGN JWT GAME TOKENS>
    CATALLI_DATABASE_URL="mongodb://localhost/catalli-cc" \
    CATALLI_DEBUG="true" \
    CATALLI_FACEBOOK_TOKEN=<TOKEN YOU GOT FROM FACEBOOK> \
    CATALLI_FACEBOOK_CLIENT_ID=<CLIENT ID YOU GOT FROM FACEBOOK> \
    CATALLI_FACEBOOK_SECRET=<SECRET YOU GOT FROM FACEBOOK> \
    node server.js

I would recommend creating a IDE run configuration for that.

### Running tests

    npm run test

### Generating documentation

    npm run generate-docs

### Preparing for distribution

See https://blog.risingstack.com/node-js-production-checklist/

    # change version
    vi package.json
    # bump the version:
    # see http://semver.org/
    # 0.0.1-snapshot -> 0.0.1            (when releasing)
    # 0.0.1-snapshot -> 0.0.1-snapshot   (no need to change for just another snapshot)
    # 0.0.1          -> 0.0.2-snapshot   (when starting development on new version)

    # lock versions
    npm shrinkwrap

    # install nsp if necessary
    npm install nsp --global

    # use nsp
    nsp check
    # in case of problems found, fix necessary things on package.json and start with `npm shrinkwrap` again



### Create distributable

Build image

    docker build -t catalli-local/catalli-cc-backend .


First of all, test the distributable on your machine. That means, run the Docker container on your local
and then push it to private registry.

BTW, you need to configure your MongoDB so that it accepts connections from outside.
See following:

- http://stackoverflow.com/questions/20778771/what-is-the-difference-between-0-0-0-0-127-0-0-1-and-localhost
- http://stackoverflow.com/questions/18412850/cannot-connect-to-mongodb-using-machine-ip


Build image:

    docker run -p 4100:4100 --rm=true \
        --env CATALLI_ACCESS_TOKEN_SECRET=<SOME SECRET TO SIGN JWT ACCESS TOKENS> \
        --env CATALLI_GAME_TOKEN_SECRET=<SOME SECRET TO SIGN JWT GAME TOKENS>     \
        --env CATALLI_DATABASE_URL="mongodb://<IP_OF_YOUR_MACHINE>/catalli-cc" \
        --env CATALLI_DEBUG="true" \
        --env CATALLI_FACEBOOK_TOKEN=<TOKEN YOU GOT FROM FACEBOOK> \
        --env CATALLI_FACEBOOK_CLIENT_ID=<CLIENT ID YOU GOT FROM FACEBOOK> \
        --env CATALLI_FACEBOOK_SECRET=<SECRET YOU GOT FROM FACEBOOK> \
        catalli-local/catalli-cc-backend

Make sure you replace <IP_OF_YOUR_MACHINE>!

Maybe do some more tests. On OSX, go to <http://192.168.99.100:4100/>.

Ok, all good. Your image is awesome.

### Tag and push distributable

Assume you've just built the image and you want to mark it as version **4.21.9**.
Then do:

    # tag locally
    docker tag catalli-local/catalli-cc-backend catalli-local/catalli-cc-backend:4.21.9
    # tag for registry
    docker tag catalli-local/catalli-cc-backend:4.21.9 <DOCKER_REGISTRY_URL>/catalli-cc-backend:4.21.9
    # push to registry
    docker push <DOCKER_REGISTRY_URL>/catalli-cc-backend:4.21.9
    # this takes a while for the first time... it might be ~300 MB

We use version names like **4.21.9** for releases and tag **latest** for snapshots.
That means, when you want to push a new snapshot, do following:

    # tag for registry
    docker tag catalli-local/catalli-cc-backend <DOCKER_REGISTRY_URL>/catalli-cc-backend:latest
    docker push <DOCKER_REGISTRY_URL>/catalli-cc-backend:latest



### Deploy

##### Configuring the target system

We need to pass some environment variables to application. We're gonna use `--env-file` option of Docker.
So, let's prepare that file.

    sudo mkdir -p /usr/local/catalli-cc-backend/
    sudo vi /usr/local/catalli-cc-backend/env.list
    # paste following
        CATALLI_ACCESS_TOKEN_SECRET=<SOME SECRET TO SIGN JWT ACCESS TOKENS>  /
        CATALLI_GAME_TOKEN_SECRET=<SOME SECRET TO SIGN JWT GAME TOKENS>      /
        CATALLI_DATABASE_URL="mongodb://<HOSTNAME_OF_THE_MONGODB_MACHINE>/catalli-cc" \
        CATALLI_DEBUG="true" \
        CATALLI_FACEBOOK_TOKEN=<TOKEN YOU GOT FROM FACEBOOK> \
        CATALLI_FACEBOOK_CLIENT_ID=<CLIENT ID YOU GOT FROM FACEBOOK> \
        CATALLI_FACEBOOK_SECRET=<SECRET YOU GOT FROM FACEBOOK> \

And adapt stuff which are in <>.

##### Run the application on the target system

If not already logged in, login to registry:

    docker login <DOCKER_REGISTRY_URL>
    # use the CI user

Pull the image and run it:

    docker pull <DOCKER_REGISTRY_URL>/catalli-cc-backend:<VERSION>

    docker run -p 4100:4100 -d \
            --add-host <HOSTNAME_OF_THE_MONGODB_MACHINE>:<IP_OF_THE_MONGODB_MACHINE> \
            --env-file /usr/local/catalli-cc-backend/env.list      \
            <DOCKER_REGISTRY_URL>/catalli-cc-backend:<VERSION>

Make sure you adapt `<VERSION>`!

Give it a try:

    curl <HOSTNAME_OF_THE_TARGET_SYSTEM>:4100/api/v1/public/masks/560a50768dfe8a247459e917
    # it is ok to see `{"status":400,"message":"User not found"}`
