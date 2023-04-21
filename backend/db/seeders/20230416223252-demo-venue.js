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
        address: 'Area 51',
        city: 'Las Vegas',
        state: 'NV',
        lat: 37.2431,
        lng: 115.7930
      },
      {
        groupId: 2,
        address: '1681 Broadway',
        city: 'New York City',
        state: 'NY',
        lat: 40.7634,
        lng: 73.9833
      },
      {
        groupId: 3,
        address: '2207 Lou Neff Rd',
        city: 'Austin',
        state: 'TX',
        lat: 30.2665,
        lng: 97.7688
      }
    ])
  },

  async down (queryInterface, Sequelize) {
    const Op = Sequelize.Op;
    options.tableName = 'Venues';
    await queryInterface.bulkDelete(options, {
      groupId: {[Op.in]: [1,2,3]}
    }, {})
  }
};
