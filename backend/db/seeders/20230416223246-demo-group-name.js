'use strict';

/** @type {import('sequelize-cli').Migration} */
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    options.tableName = 'GroupImages';
    await queryInterface.bulkInsert(options, [
      {
        groupId: 1,
        url: 'www.picture1.com',
        preview: true,
      },
      {
        groupId: 2,
        url: 'www.picture1.com',
        preview: true,
      },
      {
        groupId: 3,
        url: 'www.picture1.com',
        preview: false,
      },
      {
        groupId: 4,
        url: 'www.picture1.com',
        preview: false,
      },
      {
        groupId: 5,
        url: 'www.picture1.com',
        preview: true,
      },
      {
        groupId: 1,
        url: 'www.picture2.com',
        preview: true,
      },
      {
        groupId: 2,
        url: 'www.picture2.com',
        preview: true,
      },
      {
        groupId: 3,
        url: 'www.picture2.com',
        preview: false,
      },
      {
        groupId: 4,
        url: 'www.picture2.com',
        preview: false,
      },
      {
        groupId: 5,
        url: 'www.picture2.com',
        preview: true,
      },
    ])
  },

  async down (queryInterface, Sequelize) {
    const Op = Sequelize.Op;
    options.tableName = 'GroupImages';
    await queryInterface.bulkDelete(options, {
      groupId: {[Op.in]: [1,2,3,4,5]}
    }, {})
  }
};
