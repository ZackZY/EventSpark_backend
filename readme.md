# to create new folder
mkdir [folderName]

# to create new file 
> [filename]

# to run docker for local database
docker-compose up -d

# add new migration file 
npx sequelize-cli migration:generate --name migration-name
manually update the js file found in db/migrations

# to update database based on migration
npx sequelize-cli db:migrate

# to revert migration done to db
npx sequelize-cli db:migrate:undo

# running test
npm test

# Using Test Coverage
npx jest --coverage

# to start running application locally
npm run local

# test payload to create event
curl --request POST \
  --url http://localhost:3001/events/events \
  --header 'content-type: application/json' \
  --data '{
    "organiserId": "e1a44ded-9cca-4d4c-93cd-6e60a707e149",
    "eventName": "Second Event",
    "eventDescription": "Second Event",
    "eventDate": "2024-10-12",
    "eventTimeStart": "18:00",
    "eventTimeEnd": "20:30:",
    "eventLocation": "NCS HUB",
    "eventType": "PUBLIC",
    "attendees": [
    { "email": "john.doe@example.com" },
    { "email": "jane.smith@example.com" },
    { "email": "alice.johnson@example.com" }
  ]
  }'

-- http://localhost:3001/events/events/newinvite/:id
  {
    "attendees" : [
      { "email": "john.doe@example.com" },
      { "email": "jane.smith@example.com" },
      { "email": "alice.johnson@example.com" }
    ]
  }
