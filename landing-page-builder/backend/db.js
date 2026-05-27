const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'data', 'landing-page.db'),
  logging: false,
});

const Section = sequelize.define('Section', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  type: {
    type: DataTypes.ENUM(
      'navbar',
      'hero',
      'social-proof',
      'features',
      'how-it-works',
      'benefits',
      'pricing',
      'faq',
      'footer'
    ),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'New Section',
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: '{}',
    get() {
      const raw = this.getDataValue('content');
      try {
        return JSON.parse(raw);
      } catch {
        return {};
      }
    },
    set(value) {
      this.setDataValue('content', JSON.stringify(value));
    },
  },
  settings: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: '{}',
    get() {
      const raw = this.getDataValue('settings');
      try {
        return JSON.parse(raw);
      } catch {
        return {};
      }
    },
    set(value) {
      this.setDataValue('settings', JSON.stringify(value));
    },
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  enabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
});

module.exports = { sequelize, Section };
