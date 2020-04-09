FROM node:latest

# Create app directory
RUN mkdir -p /home/Service
WORKDIR /home/Service/IMserver

# Bundle app source
COPY . /home/Service/IMserver
RUN npm install yarn
RUN yarn

EXPOSE 3000
RUN node index.js
# CMD [ "npm", "start" ]