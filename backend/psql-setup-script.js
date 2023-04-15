const { sequelize } = require('./db/models');

sequelize.showAllSchemas({ logging: false }).then(async (data) => {
  if (!data.includes(process.env.SCHEMA)) {
    await sequelize.createSchema(process.env.SCHEMA);
  }
});


// Remember, any sequelize db: commands need to be prefixed with dotenv to load the database configuration
// environment variables from the .env file.
