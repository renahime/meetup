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
        name: 'Printemps',
        about: 'Printemps is a sub-unit under μs. The unit consists of three members, namely group leader Honoka Kosaka, Kotori Minami and Hanayo Koizumi. They debuted with the song Love marginal.',
        type: 'In person',
        private: "Private",
        city: 'Tokyo',
        state: 'JP',
        previewImage: 'https://static.wikia.nocookie.net/love-live/images/a/a7/Printemps_Eien_Friends.jpg'
      },
      {
        organizerId: 2,
        name: "Bibi",
        about: "BiBi is a sub-unit under μ's. The unit consists of three members, namely leader Eli Ayase, Maki Nishikino, and Nico Yazawa. They debuted with the song Diamond Princess no Yuuutsu.",
        type: 'In person',
        private: "Private",
        city: 'Tokyo',
        state: 'JP',
        previewImage: 'https://static.wikia.nocookie.net/love-live/images/d/d4/Diamond_Princess_No_Yuutsu_-_cover.jpg'
      },
      {
        organizerId: 9,
        name: 'Lily White',
        about: 'Lily white is a sub-unit under μs. The unit consists of three members, namely leader Umi Sonoda, Rin Hoshizora and Nozomi Tojo. They debuted with the song Shiranai Love*Oshiete Love.',
        type: 'In person',
        private: "Private",
        city: 'Tokyo',
        state: 'JP',
        previewImage: 'https://static.wikia.nocookie.net/love-live/images/0/08/Lily_White_Shiranai_Love_Oshiete_Love.jpg'
      },
      {
        organizerId: 11,
        name: 'Guilty Kiss',
        about: "Guilty Kiss is a sub-unit under Aqours. The unit consists of three members, namely Riko Sakurauchi, Yoshiko Tsushima, and Mari Ohara. ",
        type: 'In person',
        private: "Private",
        city: 'Osaka',
        state: 'JP',
        previewImage: 'https://static.wikia.nocookie.net/love-live/images/4/43/Strawberry_Trapper.jpg'
      },
      {
        organizerId:10,
        name: 'CYaRon!',
        about: "We are a group of people who enjoy laughing and making silly jokes. If you can make us laugh you are welcome to join.",
        type: 'In person',
        private: "Private",
        city: 'Osaka',
        state: 'JP',
        previewImage: 'https://lastfm.freetls.fastly.net/i/u/300x300/599c3aedfd70135881b95c9e49f0996b.jpg'
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
