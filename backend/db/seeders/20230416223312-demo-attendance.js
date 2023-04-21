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
        status: 'Attending',
      },
      {
        userId: 3,
        eventId: 3,
        status: 'Attending',
      },
      {
        userId: 4,
        eventId: 4,
        status: 'Attending',
      },
      {
        userId: 5,
        eventId: 5,
        status: 'Attending',
      },
      {
        userId: 6,
        eventId: 1,
        status: 'Waitlist',
      },
      {
        userId: 7,
        eventId: 2,
        status: 'Waitlist',
      },
      {
        userId:8,
        eventId: 3,
        status: 'Waitlist',
      },
      {
        userId: 9,
        eventId: 4,
        status: 'Waitlist',
      },
      {
        userId: 10,
        eventId: 5,
        status: 'Waitlist',
      },
      {
        userId: 11,
        eventId: 1,
        status: 'Pending',
      },
      {
        userId: 12,
        eventId: 2,
        status: 'Pending',
      },
      {
        userId: 13,
        eventId: 3,
        status: 'Pending',
      },
      {
        userId: 14,
        eventId: 4,
        status: 'Pending',
      },
      {
        userId: 15,
        eventId: 5,
        status: 'Pending',
      },
      {
        userId: 16,
        eventId: 1,
        status: 'Pending',
      },
      {
        userId: 17,
        eventId: 2,
        status: 'Pending',
      },
      {
        userId: 18,
        eventId: 3,
        status: 'Pending',
      },
      {
        userId: 19,
        eventId: 4,
        status: 'Pending',
      },
      {
        userId: 20,
        eventId: 5,
        status: 'Pending',
      }
    ])
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Attendances';
    const Op = Sequelize.Op;
    await queryInterface.bulkDelete(options, {
      userId: {[Op.in]: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]}
    }, {})
  }
};
