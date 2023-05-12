'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Event.belongsTo(models.Group, {
        foreignKey: 'groupId',
      })
      Event.belongsTo(models.Venue, {
        foreignKey: 'venueId'
      })
      Event.hasMany(models.EventImage, {
        foreignKey: 'eventId',
        onDelete: 'CASCADE',
        hooks: true
      })
      Event.belongsToMany(models.User, {
        through: 'Attendance',
        foreignKey: 'eventId',
        otherKey: 'userId'
      })
      Event.hasMany(models.Attendance, {
        foreignKey: 'eventId',
        onDelete: 'CASCADE',
        hooks: true
      })
    }
  }
  Event.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    venueId:{
      type:DataTypes.INTEGER,
      references: {
        model:'Venues'
      },
      hooks: true,
      allowNull:true,
    },
    groupId:{
      type:DataTypes.INTEGER,
      references: {
        model: 'Groups'
      },
      hooks: true
    },
    name: {
      type:DataTypes.STRING,
      validate: {
        isFive(value){
          if(value.length < 5)
            throw new Error('Must be at least 5 chars');
        }
      }
    },
    description:{
      type:DataTypes.STRING,
      allowNull:false,
    },
    type:{
      type:DataTypes.ENUM('Online', 'In person'),
      validate: {
        isIn: [['Online', 'In person']]
      }
    },
    capacity:{
      type:DataTypes.INTEGER,
      validate:{
        min:0
      }
    },
    price:{
      type:DataTypes.DECIMAL(4,2),
      validate:{
        min:0
      }
    },
    previewImage: {
      type:DataTypes.STRING,
      allowNull:false
    },
    startDate:{
      type:DataTypes.DATE,
      validate:{
        isDate: true,
        happened(value){
          if (value <= new Date()){
            throw new Error('Events cannot already happen')
          }
        }
      }
    },
    endDate:{
      type:DataTypes.DATE,
      validate:{
        isDate:true,
        isAfter(value){
          if(value < this.startDate){
            throw new Error('End date cannot be before start')
          }
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Event',
  });
  return Event;
};
