'use strict';
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    options.tableName = 'Attendances';
    await queryInterface.bulkInsert(options, [
      {
        userId: 1,
        eventId: 1,
        status: 'Attending',
      },
      {
        userId: 2,
        eventId: 2,
        status: 'Waitlist',
      },
      {
        userId: 3,
        eventId: 3,
        status: 'Pending',
      },
      {
        userId: 4,
        eventId: 4,
        status: 'Attending',
      },
      {
        userId: 5,
        eventId: 5,
        status: 'Waitlist',
      }
    ])
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Attendances';
    const Op = Sequelize.Op;
    await queryInterface.bulkDelete(options, {
      userId: {[Op.in]: [1, 2, 3, 4, 5]}
    }, {})
  }
};
