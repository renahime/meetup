'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Attendance extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Attendance.belongsTo(models.User, {
        foreignKey: 'userId',
        hooks: true
      })
      Attendance.belongsTo(models.Event, {
        foreignKey: 'eventId',
        hooks: true
      })
    }
  }
  Attendance.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    eventId: {
      type:DataTypes.INTEGER,
      references: {
        model: 'Events'
      },
      hooks: true
    },
    userId: {
      type:DataTypes.INTEGER,
      references: {
        model: 'Users'
      },
      hooks: true
    },
    status:{
      type:DataTypes.ENUM('attending','waitlist','pending'),
      allowNull:false,
      validate: {
        isIn: [['attending','waitlist','pending']]
      }
    }
  }, {
    sequelize,
    modelName: 'Attendance',
  });
  return Attendance;
};
