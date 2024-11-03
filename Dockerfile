# Use Node.js 20 (Long Term Support) as base image
FROM node:20-alpine

ARG NODE_ENV
ARG DB_HOST
ARG DB_USER
ARG DB_PASSWORD
ARG DB_NAME
ARG DB_PORT
ARG ORIGIN
ARG AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY

ENV NODE_ENV=$NODE_ENV
ENV DB_HOST=$DB_HOST
ENV DB_USER=$DB_USER
ENV DB_PASSWORD=$DB_PASSWORD
ENV DB_NAME=$DB_NAME
ENV DB_PORT=$DB_PORT
ENV ORIGIN=$ORIGIN
ENV AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
ENV AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY

# Set working directory
WORKDIR /code

# Copy package.json and package-lock.json
COPY package.json /code/package.json
COPY package-lock.json /code/package-lock.json

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . /code

# Expose the port your app runs on
EXPOSE 3001

# Command to run the application
CMD ["node", "app.js", "--port", "3001"]