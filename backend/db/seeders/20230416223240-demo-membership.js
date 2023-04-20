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
        status: 'Co-Host',
      },
      {
        userId: 2,
        groupId: 2,
        status: 'Co-Host',
      },
      {
        userId: 3,
        groupId: 3,
        status: 'Pending',
      },

      {
        userId: 4,
        groupId: 4,
        status: 'Pending',
      },
      {
        userId: 5,
        groupId: 5,
        status: 'Member',
      }
    ], {})
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Memberships';
    const Op = Sequelize.Op;
    await queryInterface.bulkDelete(options, {
      userId: {[Op.in]: [1, 2, 3, 4, 5]}
    }, {})
  }
};
