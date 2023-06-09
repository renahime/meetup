'use strict';
const {
  Model
} = require('sequelize');
const { Sequelize } = require('.');
module.exports = (sequelize, DataTypes) => {
  class Group extends Model {
    static associate(models) {
      Group.belongsTo(models.User, {
        foreignKey: 'organizerId',
        as: 'Organizer'
      })
      Group.belongsToMany(models.User, {
        through: 'Membership',
        foreignKey: 'groupId',
        otherKey: 'userId'
      })
      Group.hasMany(models.GroupImage, {
        foreignKey: 'groupId',
        onDelete: 'CASCADE',
        hooks: true
      })
      Group.hasMany(models.Membership, {
        foreignKey: 'groupId',
        onDelete: 'CASCADE',
        hooks: true
      })
      Group.hasMany(models.Event, {
        foreignKey: 'groupId',
        onDelete: 'CASCADE',
        hooks: true
      })
      Group.hasMany(models.Venue, {
        foreignKey: 'groupId',
        as: 'Venue',
        onDelete: 'CASCADE',
        hooks: true
      })
      Group.belongsToMany(models.Venue, {
        through: 'Event',
        foreignKey: 'groupId',
        otherKey: 'venueId'
      })
    }
  }
  Group.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    organizerId: {
      type: DataTypes.INTEGER,
      allowNull:false,
      references: {
        model: 'Users'
      },
      onDelete: 'CASCADE',
      hooks: true,
      allowNull: false,
    },
    name: {
      type:DataTypes.STRING,
      allowNull:false,
      validate: {
        len:[0,60]
      }
    },
    about:{
      type:DataTypes.STRING,
      validate:{
        is50(value){
          if(value.length < 30){
            throw new Error('About must be 30 chars or more!')
          }
        }
      }
    } ,
    type: {
      type:DataTypes.ENUM('Online', 'In person'),
      allowNull:false,
      validate:{
        isIn: [['Online', 'In person']]
      }
    } ,
    private: {
      type:DataTypes.STRING,
      allowNull:false
    },
    city: {
      type:DataTypes.STRING,
      allowNull:false,
    },
    state:{
      type:DataTypes.STRING,
      allowNull:false
    },
    previewImage:{
      type:DataTypes.STRING,
      allowNull:false
    }
  }, {
    sequelize,
    modelName: 'Group',
  });
  return Group;
};
