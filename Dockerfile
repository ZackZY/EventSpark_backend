# Use Node.js 20 (Long Term Support) as base image
FROM node:20-alpine

# Set working directory
WORKDIR /code

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . /code

# Expose the port your app runs on
EXPOSE 3001

# Command to run the application
CMD ["npm", "run", "local"]