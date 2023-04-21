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
        name: 'Naruto Run',
        about: 'Come join us as we Naruto run our way into Area 51, if they cannot catch all of us then they will not arrest us',
        type: 'In-Person',
        private: false,
        city: 'Las Vegas',
        state: 'NV'
      },
      {
        organizerId: 2,
        name: 'Les Miserables Live',
        about: "Set in early 19th-century France, Les Misérables is the story of Jean Valjean, a French peasant, and his desire for redemption, released in 1815 after serving nineteen years in jail for stealing a loaf of bread for his sister's starving child.",
        type: 'In-Person',
        private: false,
        city: 'New York City',
        state: 'NY'
      },
      {
        organizerId: 3,
        name: 'BBQ Competition',
        about: 'Looking to show off your incredible BBQ making skills? Or maybe the opposite. As long as you show up with BBQ of any kind (SOYLENT GREEN BANNED SINCE 2021) we will serve it',
        type: 'In-Person',
        private: false,
        city: 'Austin',
        state: 'TX'
      },
      {
        organizerId: 4,
        name: 'MIKUEXPO',
        about: 'A free online and VR Concert made together, with fans from around the world! Come enjoy the wonder tunes of Hatsune Miku!',
        type: 'Virtual',
        private: false,
        city: 'Online',
        state: 'Online'
      },
      {
        organizerId: 5,
        name: 'Comedy In English',
        about: "LA 's Popular Intl. Com Show now on Zoom! Join us every Sunday at 10am Pacific! Check out the Show 5EveryDay.com named one of the Top 5!",
        type: 'Virtual',
        private: false,
        city: 'Los Angeles',
        state: 'CA'
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
