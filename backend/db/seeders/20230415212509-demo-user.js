'use strict';
const bcrypt = require("bcryptjs");

/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    options.tableName = 'Users';
    return queryInterface.bulkInsert(options, [
      {
        email: 'user1@user.io',
        firstName: 'Honoka',
        lastName: 'Kosaka',
        username: 'Muse1',
        hashedPassword: bcrypt.hashSync('password')
      },
      {
        email: 'user2@user.io',
        firstName: 'Eli',
        lastName: 'Ayase',
        username: 'Muse2',
        hashedPassword: bcrypt.hashSync('password2')
      },
      {
        email: 'user3@user.io',
        firstName: 'Kotori',
        lastName: 'Minami',
        username: 'Muse3',
        hashedPassword: bcrypt.hashSync('password3')
      },
      {
        email: 'user4@user.io',
        firstName: 'Rin',
        lastName: 'Hoshizora',
        username: 'Muse4',
        hashedPassword: bcrypt.hashSync('password4')
      },
      {
        email: 'user5@user.io',
        firstName: 'Maki',
        lastName: 'Nishikino',
        username: 'Muse5',
        hashedPassword: bcrypt.hashSync('password5')
      },
      {
        email: 'user6@user.io',
        firstName: 'Nozomi',
        lastName: 'Tojo',
        username: 'Muse6',
        hashedPassword: bcrypt.hashSync('password6')
      },
      {
        email: 'user7@user.io',
        firstName: 'Hanayo',
        lastName: 'Koizumi',
        username: 'Muse7',
        hashedPassword: bcrypt.hashSync('password7')
      },
      {
        email: 'user8@user.io',
        firstName: 'Nico',
        lastName: 'Yazawa',
        username: 'Muse8',
        hashedPassword: bcrypt.hashSync('password8')
      },
      {
        email: 'user9@user.io',
        firstName: 'Umi',
        lastName: 'Sonoda',
        username: 'Muse9',
        hashedPassword: bcrypt.hashSync('password9')
      },
      {
        email: 'user10@user.io',
        firstName: 'Chika',
        lastName: 'Takami',
        username: 'Aqours1',
        hashedPassword: bcrypt.hashSync('password10')
      },
      {
        email: 'user11@user.io',
        firstName: 'Riko',
        lastName: 'Sakurauchi',
        username: 'Aqours2',
        hashedPassword: bcrypt.hashSync('password11')
      },
      {
        email: 'user12@user.io',
        firstName: 'Kanan',
        lastName: 'Matsuura',
        username: 'Aqours3',
        hashedPassword: bcrypt.hashSync('password12')
      },
      {
        email: 'user13@user.io',
        firstName: 'Dia',
        lastName: 'Kurosawa',
        username: 'Aqours4',
        hashedPassword: bcrypt.hashSync('password13')
      },
      {
        email: 'user14@user.io',
        firstName: 'You',
        lastName: 'Watanabe',
        username: 'Aqours5',
        hashedPassword: bcrypt.hashSync('password14')
      },
      {
        email: 'user15@user.io',
        firstName: 'Yoshiko',
        lastName: 'Tsusuhima',
        username: 'Aqours6',
        hashedPassword: bcrypt.hashSync('password15')
      },
      {
        email: 'user16@user.io',
        firstName: 'Hanamaru',
        lastName: 'Kunikida',
        username: 'Aqours7',
        hashedPassword: bcrypt.hashSync('password16')
      },
      {
        email: 'user17@user.io',
        firstName: 'Mari',
        lastName: 'Ohara',
        username: 'Aqours8',
        hashedPassword: bcrypt.hashSync('password17')
      },
      {
        email: 'user18@user.io',
        firstName: 'Ruby',
        lastName: 'Kurosawa',
        username: 'Aqours9',
        hashedPassword: bcrypt.hashSync('password18')
      },
      {
        email: 'user19@user.io',
        firstName: 'Waylon',
        lastName: 'Roberts',
        username: 'FakeUser19',
        hashedPassword: bcrypt.hashSync('password19')
      },
      {
        email: 'user20@user.io',
        firstName: 'Waylon',
        lastName: 'Roberts',
        username: 'FakeUser20',
        hashedPassword: bcrypt.hashSync('password20')
      },
      {
        email: 'user21@user.io',
        firstName: 'Lennon',
        lastName: 'Jones',
        username: 'FakeUser21',
        hashedPassword: bcrypt.hashSync('password21')
      },
      {
        email: 'user22@user.io',
        firstName: 'Nolan',
        lastName: 'Morris',
        username: 'FakeUser22',
        hashedPassword: bcrypt.hashSync('password22')
      },
      {
        email: 'user23@user.io',
        firstName: 'Kenzie',
        lastName: 'Castillo',
        username: 'FakeUser23',
        hashedPassword: bcrypt.hashSync('password23')
      },
      {
        email: 'user24@user.io',
        firstName: 'Khloe',
        lastName: 'Floyd',
        username: 'FakeUser24',
        hashedPassword: bcrypt.hashSync('password24')
      },
      {
        email: 'user25@user.io',
        firstName: 'Juan',
        lastName: 'Gomez',
        username: 'FakeUser25',
        hashedPassword: bcrypt.hashSync('password25')
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = 'Users';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      username: { [Op.in]: ['FakeUser3', 'FakeUser1', 'FakeUser2', 'FakeUser4', 'FakeUser5'
      ,'FakeUser6', 'FakeUser7', 'FakeUser8',
      'FakeUser9', 'FakeUser10','FakeUser11', 'FakeUser12', 'FakeUser13', 'FakeUser14', 'FakeUser15',
      'FakeUser16', 'FakeUser17', 'FakeUser18', 'FakeUser19', 'FakeUser20',
      'FakeUser21', 'FakeUser22', 'FakeUser23', 'FakeUser24', 'FakeUser25'] }
    }, {});
  }
};
