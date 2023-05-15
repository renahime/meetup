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
        name: 'Eien Friends',
        description: 'Eien Friends (永遠フレンズ lit. Eternal Friends) is a song from Printemps third single. Printemps is a sub-unit under μs; the group consists of Honoka Kosaka, Hanayo Koizumi, and Kotori Minami. ',
        type: 'In person',
        capacity: 200,
        price: 200,
        previewImage: 'https://static.wikia.nocookie.net/love-live/images/a/a7/Printemps_Eien_Friends.jpg',
        startDate: new Date('2023-01-11'),
        endDate: new Date('2023-01-12'),
      },
      {
        venueId: 1,
        groupId: 1,
        name: 'CheerDay CheerGirl!',
        description: "CheerDay CheerGirl! is a bonus CD by Printemps. Printemps is a sub-unit under μs; the group consists of Honoka Kosaka, Hanayo Koizumi, and Kotori Minami.",
        type: 'In person',
        capacity: 200,
        price: 150,
        previewImage: 'https://static.wikia.nocookie.net/love-live/images/3/33/LLS2_BDs_Printemps_Bonus_CD.png',
        startDate: new Date('2023-05-21'),
        endDate: new Date('2023-05-22'),
      },
      {
        venueId: 2,
        groupId: 2,
        name: 'Fuyu ga Kureta Yokan',
        description: 'Fuyu ga Kureta Yokan (冬がくれた予感 lit. The Premonition Winter Gave Me) is a song from BiBis third single. BiBi is a sub-unit under μs; the group consists of Maki Nishikino, Eli Ayase, and Nico Yazawa. It was first previewed by being released for play on Love Live! School idol festival on December 5, 2014.',
        type: 'In person',
        capacity: 50,
        price: 100,
        previewImage: 'https://static.wikia.nocookie.net/love-live/images/1/1e/Fuyu_ga_Kureta_Yokan_Cover.png',
        startDate: new Date('2023-05-01'),
        endDate: new Date('2023-05-02'),
      },
      {
        venueId: 2,
        groupId: 2,
        name: 'Silent tonight',
        description: 'Silent tonight is a bonus CD sung by BiBi. BiBi is a sub-unit under μ’s; the group consists of Eli Ayase, Maki Nishikino, and Nico Yazawa. The bonus CD is included in purchasing the entire Love Live! Season 2 Blu-rays from Animate (アニメイト).',
        type: 'In person',
        capacity: 50,
        price: 100,
        previewImage: 'https://static.wikia.nocookie.net/love-live/images/2/26/LLS2_BDs_BiBi_Bonus_CD.jpg',
        startDate: new Date('2023-05-24'),
        endDate: new Date('2023-05-26'),
      },
      {
        venueId: 3,
        groupId: 3,
        name: 'Aki no Anata no Sora Tooku',
        description: "Aki no Anata no Sora Tooku (秋のあなたの空遠く lit. Your Autumn Sky Is Distant) is a song from lily white's third single. lily white is a sub-unit under μs; the group consists of Umi Sonoda, Rin Hoshizora, and Nozomi Tojo. ",
        type: 'In person',
        capacity: 50,
        price: 40,
        previewImage: 'https://static.wikia.nocookie.net/love-live/images/4/44/Aki_no_Anata_no_Sora_Tooku.jpg',
        startDate: new Date('2023-05-02'),
        endDate: new Date('2023-05-02'),
      },
      {
        venueId: 3,
        groupId: 3,
        name: 'Otohime Heart de Love Kyuuden',
        description: "Otohime Heart de Love Kyuuden (乙姫心で恋宮殿おとひめはーとでらぶきゅうでん lit. A Palace of Love in the Maiden Princess's Heart) is a bonus CD sung by lily white. lily white is a sub-unit under μs; the group consists of Umi Sonoda, Rin Hoshizora, and Nozomi Tojo.",
        type: 'In person',
        capacity: 50,
        price: 40,
        previewImage: 'https://static.wikia.nocookie.net/love-live/images/c/ca/Otohime_Haato_de_Rabu_Kyuuden.png',
        startDate: new Date('2023-05-22'),
        endDate: new Date('2023-05-22'),
      },
      {
        venueId: 1,
        groupId: 4,
        name: 'Guilty!? Farewell party',
        description: "Guilty!? Farewell party is a bonus CD sung by Guilty Kiss, a sub-unit under Aqours. The group consists of Riko Sakurauchi, Yoshiko Tsushima, and Mari Ohara. The CD is a bonus for purchasing the entire Love Live! Sunshine!! Season 2",
        type: 'In person',
        capacity: 100,
        price: 100,
        previewImage: 'https://static.wikia.nocookie.net/love-live/images/0/00/Guilty_farewell_party.png',
        startDate: new Date('2023-05-02'),
        endDate: new Date('2023-05-02'),
      },      {
        venueId: 1,
        groupId: 4,
        name: 'Shooting Star Warrior',
        description: "Shooting Star Warrior is an album sung by Guilty Kiss, a sub-unit under Aqours. The group consists of Riko Sakurauchi, Yoshiko Tsushima, and Mari Ohara. It was released on July 28, 2021.",
        type: 'In person',
        capacity: 100,
        price: 100,
        previewImage: 'https://static.wikia.nocookie.net/love-live/images/0/0d/Shooting_Star_Warrior.jpg',
        startDate: new Date('2023-05-24'),
        endDate: new Date('2023-05-24'),
      },
      {
        venueId: 1,
        groupId: 5,
        name: 'Braveheart Coaster',
        description: "Braveheart Coaster is a single sung by CYaRon!, a sub-unit under Aqours. The group consists of Chika Takami, You Watanabe, and Ruby Kurosawa.",
        type: 'In person',
        capacity: 2,
        price: 2,
        previewImage: 'https://static.wikia.nocookie.net/love-live/images/7/76/SakuraBaibai.png',
        startDate: new Date('2023-05-26'),
        endDate: new Date('2023-05-26'),
      },
      {
        venueId: 1,
        groupId: 5,
        name: 'Sakura Bye Bye',
        description: "Sakura Bye Bye (サクラバイバイ lit. Bye-bye Cherry Blossoms) is a bonus CD sung by CYaRon!, a sub-unit under Aqours. The group consists of Chika Takami, You Watanabe, and Ruby Kurosawa.",
        type: 'In person',
        capacity: 3,
        price: 2,
        previewImage: 'https://static.wikia.nocookie.net/love-live/images/9/95/Braveheart_Coaster.jpg',
        startDate: new Date('2023-05-04'),
        endDate: new Date('2023-05-04'),
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
