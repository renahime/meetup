'use strict';

/** @type {import('sequelize-cli').Migration} */
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    options.tableName = 'Memberships';
    await queryInterface.bulkInsert(options, [
      {
        userId: 1,
        groupId: 1,
        status: 'organizer',
      },
      {
        userId: 2,
        groupId: 2,
        status: 'organizer',
      },
      {
        userId: 3,
        groupId: 3,
        status: 'organizer',
      },

      {
        userId: 4,
        groupId: 4,
        status: 'organizer',
      },
      {
        userId: 5,
        groupId: 5,
        status: 'organizer',
      },
      {
        userId: 6,
        groupId: 1,
        status: 'member',
      },
      {
        userId: 7,
        groupId: 2,
        status: 'member',
      },
      {
        userId: 8,
        groupId: 3,
        status: 'member',
      },

      {
        userId: 9,
        groupId: 4,
        status: 'member',
      },
      {
        userId: 10,
        groupId: 5,
        status: 'member',
      },
      {
        userId: 11,
        groupId: 1,
        status: 'pending',
      },
      {
        userId: 12,
        groupId: 2,
        status: 'pending',
      },
      {
        userId: 13,
        groupId: 3,
        status: 'pending',
      },
      {
        userId: 14,
        groupId: 4,
        status: 'pending',
      },

      {
        userId: 15,
        groupId: 5,
        status: 'pending',
      },
      {
        userId: 16,
        groupId: 1,
        status: 'pending',
      },
      {
        userId: 17,
        groupId: 2,
        status: 'pending',
      },
      {
        userId: 18,
        groupId: 3,
        status: 'pending',
      },
      {
        userId: 19,
        groupId: 4,
        status: 'pending',
      },
      {
        userId: 20,
        groupId: 5,
        status: 'pending'
      },
    ], {})
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Memberships';
    const Op = Sequelize.Op;
    await queryInterface.bulkDelete(options, {
      userId: {[Op.in]: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]}
    }, {})
  }
};
