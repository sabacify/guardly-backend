FROM node:current-alpine3.18 as build

RUN apk update && apk add ca-certificates && update-ca-certificates

# We have to install nodemon globally before moving into the working directory
RUN npm install -g nodemon

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

EXPOSE 3002
ENV ADDRESS=0.0.0.0 PORT=3002

CMD ./server.sh