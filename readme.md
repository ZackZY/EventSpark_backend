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
  --url http://localhost:3000/events/events \
  --header 'content-type: application/json' \
  --data '{
	"organiserId": "0e21f219-3279-4b6c-9519-6ac6065ade4b",
	"eventName": "First Event",
	"eventDescription": "First Event",
	"eventDate": "2024-10-05",
	"eventTimeStart": "2024-10-05 00:00:00+08:00",
	"eventTimeEnd": "2024-10-06 00:00:00+08:00",
	"eventLocation": "NCS HUB",
	"eventType": "PUBLIC"
}'