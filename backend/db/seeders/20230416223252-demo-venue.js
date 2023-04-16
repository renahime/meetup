'use strict';

/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    options.tableName = 'Venues';
    await queryInterface.bulkInsert(options, [
      {
        groupId: 1,
        address: '1 Two Street',
        city: 'City',
        state: 'TX',
        lat: 0,
        lng: 0
      },
      {
        groupId: 2,
        address: '1 Two Street',
        city: 'City',
        state: 'TX',
        lat: 0,
        lng: 0
      },
      {
        groupId: 3,
        address: '1 Two Street',
        city: 'City',
        state: 'TX',
        lat: 0,
        lng: 0
      },
      {
        groupId: 4,
        address: '1 Two Street',
        city: 'City',
        state: 'TX',
        lat: 0,
        lng: 0
      },
      {
        groupId: 5,
        address: '1 Two Street',
        city: 'City',
        state: 'TX',
        lat: 0,
        lng: 0
      }
    ])
  },

  async down (queryInterface, Sequelize) {
    const Op = Sequelize.Op;
    options.tableName = 'Venues';
    await queryInterface.bulkDelete(options, {
      groupId: {[Op.in]: [1,2,3,4,5]}
    }, {})
  }
};
