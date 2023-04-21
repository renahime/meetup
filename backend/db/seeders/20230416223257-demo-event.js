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
        name: 'Naruto Run',
        description: 'Come join us as we Naruto run our way into Area 51, if they cannot catch all of us then they will not arrest us',
        type: 'In-Person',
        capacity: 50,
        price: 25.69,
        startDate: Date('2023-12-12'),
        endDate: Date('2023-12-12'),
      },
      {
        venueId: 2,
        groupId: 2,
        name: 'Les Miserables Live',
        description: "Set in early 19th-century France, Les Misérables is the story of Jean Valjean, a French peasant, and his desire for redemption, released in 1815 after serving nineteen years in jail for stealing a loaf of bread for his sister's starving child.",
        type: 'In-Person',
        capacity: 50,
        price: 25.69,
        startDate: Date('2023-12-12'),
        endDate: Date('2023-12-12'),
      },
      {
        venueId: 3,
        groupId: 3,
        name: 'BBQ Competition',
        description: 'Looking to show off your incredible BBQ making skills? Or maybe the opposite. As long as you show up with BBQ of any kind (SOYLENT GREEN BANNED SINCE 2021) we will serve it',
        type: 'In-Person',
        capacity: 50,
        price: 25.69,
        startDate: Date('2023-12-12'),
        endDate: Date('2023-12-12'),
      },
      {
        venueId: null,
        groupId: 4,
        name: 'MIKUEXPO',
        description: 'A free online and VR Concert made together, with fans from around the world! Come enjoy the wonder tunes of Hatsune Miku!',
        type: 'Virtual',
        capacity: 50,
        price: 25.69,
        startDate: new Date('2023-12-12'),
        endDate: new Date('2023-12-12'),
      },
      {
        venueId: null,
        groupId: 5,
        name: 'Comedy In English',
        description: "LA 's Popular Intl. Com Show now on Zoom! Join us every Sunday at 10am Pacific! Check out the Show 5EveryDay.com named one of the Top 5!",
        type: 'Virtual',
        capacity: 50,
        price: 25.69,
        startDate: new Date('2023-12-12'),
        endDate: new Date('2023-12-12'),
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
