'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Membership extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Membership.belongsTo(models.User, {
        foreignKey: 'userId',
        hooks: true
      })
      Membership.belongsTo(models.Group, {
        foreignKey: 'groupId',
        hooks: true
      })
    }
  }
  Membership.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type:DataTypes.INTEGER,
      references:{
        model:'Users'
      },
      hooks:true,
    },
    groupId:{
      type:DataTypes.INTEGER,
      references: {
        model: 'Groups'
      },
      hooks: true
    },
    status: {
      type:DataTypes.ENUM('organizer','co-host', 'pending', 'member'),
      validate:{
        isIn:[['organizer','co-host', 'pending', 'member']]
      }
    }
  }, {
    sequelize,
    modelName: 'Membership',
  });
  return Membership;
};
