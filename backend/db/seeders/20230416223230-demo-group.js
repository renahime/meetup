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
        name: 'Black Energetic Bears',
        about: 'We are a group of people who like to host silly events around the world, anyone and everyone is welcome as long as they are silly.',
        type: 'In person',
        private: false,
        city: 'Las Vegas',
        state: 'NV',
        previewImage: 'www.website.com'
      },
      {
        organizerId: 2,
        name: "Purple Witty Pigeons",
        about: "We are a group of people who like to go to musicals and watch preformers sing and dance. Anyone is welcome to join as long as they love musicals.",
        type: 'In person',
        private: false,
        city: 'New York City',
        state: 'NY',
        previewImage: 'www.website.com'
      },
      {
        organizerId: 3,
        name: 'Red Hungry Turtles',
        about: 'We are a group of people who like to host events where we eat all kinds of food regardless of ethics. Anyone that passes the trials are welcome.',
        type: 'In person',
        private: false,
        city: 'Austin',
        state: 'TX',
        previewImage: 'www.website.com'
      },
      {
        organizerId: 4,
        name: 'Pink Idol Kittens',
        about: 'We are a group filled with idols and idol lovers alike. We meet to go to virtual concerts and events. Anyone who loves idols can join.',
        type: 'Online',
        private: false,
        city: 'Online',
        state: 'Online',
        previewImage: 'www.website.com'
      },
      {
        organizerId: 5,
        name: 'Orange Laughing Parrots',
        about: "We are a group of people who enjoy laughing and making silly jokes. If you can make us laugh you are welcome to join.",
        type: 'Online',
        private: false,
        city: 'Online',
        state: 'Online',
        previewImage: 'www.website.com'
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
