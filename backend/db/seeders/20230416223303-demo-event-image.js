'use strict';

/** @type {import('sequelize-cli').Migration} */
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    options.tableName = 'EventImages';
    await queryInterface.bulkInsert(options, [
      {
        eventId: 1,
        url: 'www.website.com',
        preview: false,
      },
      {
        eventId: 2,
        url: 'www.website.com',
        preview: false,
      },
      {
        eventId: 3,
        url: 'www.website.com',
        preview: false,
      },
      {
        eventId: 4,
        url: 'www.website.com',
        preview: false,
      },
      {
        eventId: 5,
        url: 'www.website.com',
        preview: true,
      }
    ])
  },

  async down (queryInterface, Sequelize) {
    const Op = Sequelize.Op;
    options.tableName = 'EventImages';
    await queryInterface.bulkDelete(options, {
      eventId: {[Op.in]: [1,2,3,4,5]}
    }, {})
  }
};
