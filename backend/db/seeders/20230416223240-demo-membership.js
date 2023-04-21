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
        status: 'Host',
      },
      {
        userId: 2,
        groupId: 2,
        status: 'Host',
      },
      {
        userId: 3,
        groupId: 3,
        status: 'Host',
      },

      {
        userId: 4,
        groupId: 4,
        status: 'Host',
      },
      {
        userId: 5,
        groupId: 5,
        status: 'Host',
      },
      {
        userId: 6,
        groupId: 1,
        status: 'Member',
      },
      {
        userId: 7,
        groupId: 2,
        status: 'Member',
      },
      {
        userId: 8,
        groupId: 3,
        status: 'Member',
      },

      {
        userId: 9,
        groupId: 4,
        status: 'Member',
      },
      {
        userId: 10,
        groupId: 5,
        status: 'Member',
      },
      {
        userId: 11,
        groupId: 1,
        status: 'Pending',
      },
      {
        userId: 12,
        groupId: 2,
        status: 'Pending',
      },
      {
        userId: 13,
        groupId: 3,
        status: 'Pending',
      },
      {
        userId: 14,
        groupId: 4,
        status: 'Pending',
      },

      {
        userId: 15,
        groupId: 5,
        status: 'Pending',
      },
      {
        userId: 16,
        groupId: 1,
        status: 'Pending',
      },
      {
        userId: 17,
        groupId: 2,
        status: 'Pending',
      },
      {
        userId: 18,
        groupId: 3,
        status: 'Pending',
      },
      {
        userId: 19,
        groupId: 4,
        status: 'Pending',
      },
      {
        userId: 20,
        groupId: 5,
        status: 'Pending'
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
