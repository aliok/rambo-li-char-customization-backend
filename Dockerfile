# see https://github.com/nodesource/docker-node
# see https://docs.docker.com/engine/examples/nodejs_web_app/
# we use Ubuntu Trusty with Node 4.4.0
# both are LTS
FROM nodesource/trusty:4.4.0

# add mongodb's GPG and list file
# see https://docs.mongodb.org/manual/tutorial/install-mongodb-on-ubuntu/
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927
RUN echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list

# first line is required for having headless canvas. see https://github.com/Automattic/node-canvas
# second line is required for Mongodb client. see https://docs.mongodb.org/manual/tutorial/install-mongodb-on-ubuntu/
#    and https://github.com/rvagg/node-libssh/issues/48
RUN apt-get update && apt-get install -y \
    libcairo2-dev libjpeg8-dev libpango1.0-dev libgif-dev build-essential g++ \
    mongodb-org-shell libkrb5-dev

# cache package.json and node_modules to speed up builds
ADD package.json package.json
RUN npm install

# copy source files
ADD . .

# Express server is listening port 4100
EXPOSE  4100

# start!
CMD ["node", "server.js"]


# FYI, you need to pass some environment variables to start the container. see README.md.
