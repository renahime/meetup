'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EventImage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      EventImage.belongsTo(models.Event, {
        foreignKey: 'eventId',
        onDelete: 'CASCADE',
        hooks: true
      })
    }
  }
  EventImage.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    eventId:{
      type:DataTypes.INTEGER,
      references: {
        model: 'Events'
      },
      hooks: true
    },
    url:{
      type:DataTypes.STRING,
    },
    preview: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'EventImage',
  });
  return EventImage;
};
