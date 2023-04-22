'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Venue extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Venue.belongsTo(models.Group, {
        foreignKey: 'groupId',
        as: 'Venue',
        hooks: true
      })
      Venue.belongsToMany(models.Group, {
        through: 'Event',
        foreignKey: 'venueId',
        otherKey: 'groupId',
        hooks: true
      })
      Venue.hasMany(models.Event, {
        foreignKey: 'venueId',
        onDelete: 'CASCADE'
      })
    }
  }
  Venue.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    groupId: {
      type:DataTypes.INTEGER,
      references: {
        model: 'Groups'
      },
      onDelete: 'SET NULL',
      hooks: true
    } ,
    address:{
      type:DataTypes.STRING,
      allowNull:false
    },
    city:{
      type:DataTypes.STRING,
      allowNull:false
    },
    state:{
      type:DataTypes.STRING,
      allowNull:false
    },
    lat:{
      type:DataTypes.DECIMAL(9,7),
      allowNull:false,
      validate: {
        min:-90,
        max:90
      }
    } ,
    lng:{
      type:DataTypes.DECIMAL(10,7),
      allowNull:false,
      validate:{
        min:-180,
        max:180
      }
    }
  }, {
    sequelize,
    modelName: 'Venue',
  });
  return Venue;
};
