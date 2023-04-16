'use strict';

/** @type {import('sequelize-cli').Migration} */
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}
module.exports = {
  async up (queryInterface, Sequelize) {
    options.tableName = 'Groups'
    await queryInterface.bulkInsert(options, [
      {
        organizerId: 1,
        name: 'insert something here',
        about: 'insert something here',
        type: 'In-Person',
        private: false,
        city: 'city',
        state: 'TX'
      },
      {
        organizerId: 2,
        name: 'insert something here',
        about: 'insert something here',
        type: 'In-Person',
        private: false,
        city: 'city',
        state: 'TX'
      },
      {
        organizerId: 3,
        name: 'insert something here',
        about: 'insert something here',
        type: 'In-Person',
        private: false,
        city: 'city',
        state: 'TX'
      },
      {
        organizerId: 4,
        name: 'insert something here',
        about: 'insert something here',
        type: 'In-Person',
        private: false,
        city: 'city',
        state: 'TX'
      },
      {
        organizerId: 5,
        name: 'insert something here',
        about: 'insert something here',
        type: 'Virtual',
        private: false,
        city: 'city',
        state: 'TX'
      }
    ])
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Groups';
    const Op = Sequelize.Op;
    await queryInterface.bulkDelete(options, {
      organizerId: {[Op.in]: [1, 2, 3, 4, 5]}
    }, {})
  }
};
