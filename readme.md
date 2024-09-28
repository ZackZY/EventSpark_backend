# to run docker for local database
docker-compose up -d

# add new migration file 
npx sequelize-cli migration:generate --name migration-name
manually update the js file found in db/migrations

# to update database based on migration
npx sequelize-cli db:migrate

# to revert migration done to db
npx sequelize-cli db:migrate:undo

