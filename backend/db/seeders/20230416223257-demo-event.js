'use strict';

/** @type {import('sequelize-cli').Migration} */
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}
module.exports = {
  async up (queryInterface, Sequelize) {
    options.tableName = 'Events';
    await queryInterface.bulkInsert(options, [
      {
        venueId: 1,
        groupId: 1,
        name: 'insert something here',
        description: 'insert something here',
        type: 'Virtual',
        capacity: 50,
        price: 25.69,
        startDate: '2023-12-12',
        endDate: '2023-12-12',
      },
      {
        venueId: 2,
        groupId: 2,
        name: 'insert something here',
        description: 'insert something here',
        type: 'Virtual',
        capacity: 50,
        price: 25.69,
        startDate: '2023-12-12',
        endDate: '2023-12-12',
      },
      {
        venueId: 3,
        groupId: 3,
        name: 'insert something here',
        description: 'insert something here',
        type: 'Virtual',
        capacity: 50,
        price: 25.69,
        startDate: '2023-12-12',
        endDate: '2023-12-12',
      },
      {
        venueId: 4,
        groupId: 4,
        name: 'insert something here',
        description: 'insert something here',
        type: 'Virtual',
        capacity: 50,
        price: 25.69,
        startDate: '2023-12-12',
        endDate: '2023-12-12',
      },
      {
        venueId: 5,
        groupId: 5,
        name: 'insert something here',
        description: 'insert something here',
        type: 'Virtual',
        capacity: 50,
        price: 25.69,
        startDate: '2023-12-12',
        endDate: '2023-12-12',
      }
    ])
  },

  async down (queryInterface, Sequelize) {
    const Op = Sequelize.Op;
    options.tableName = 'Events';
    await queryInterface.bulkDelete(options, {
      groupId: {[Op.in]: [1,2,3,4,5]}
    }, {})
  }
};
