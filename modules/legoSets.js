require('dotenv').config();
const Sequelize = require('sequelize');
const setData = require("../data/setData");
const themeData = require("../data/themeData");
const pg = require('pg');
let sets = [];



// set up sequelize to point to our postgres database
const sequelize = new Sequelize(process.env.PGDATABASE, process.env.PGUSER, process.env.PGPASSWORD, {
  host: process.env.PGHOST,
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false },
  },
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((err) => {
    console.log('Unable to connect to the database:', err);
  });

const Theme = sequelize.define('Theme', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
}, {
  timestamps: false,
});

const Set = sequelize.define('Set', {
  set_num: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  year: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  num_parts: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  theme_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: Theme,
      key: 'id',
    },
  },
  img_url: {
    type: Sequelize.STRING,
    allowNull: true,
  },
}, {
  timestamps: false,
});

Set.belongsTo(Theme, {foreignKey: 'theme_id'});





function initialize() {
  return sequelize.sync();
}


function getAllSets() {
  return Set.findAll({ include: [Theme] });
}


function getSetByNum(setNum) {
  return Set.findAll({ include: [Theme], where: { set_num: setNum } })
    .then(sets => {
      if (sets.length === 0) {
        return Promise.reject("Unable to find requested set");
      } else {
        return sets[0];
      }
    });
}


function getSetsByTheme(theme) {
  return Set.findAll({ include: [Theme], where: { '$Theme.name$': { [Sequelize.Op.iLike]: `%${theme}%` } } })
    .then(sets => {
      if (sets.length === 0) {
        return Promise.reject("Unable to find requested sets");
      } else {
        return sets;
      }
    });
}


function getAllThemes() {
  return Theme.findAll();
}

function addSet(setData) {
  return Set.create(setData);
}

function editSet(set_num, setData) {
  return Set.update(setData, {
    where: {
      set_num: set_num
    }
  })
  .then(result => {
    if (result[0] === 0) {
      return Promise.reject("No set found to update");
    }
    return Promise.resolve();
  })
  .catch(err => {
    return Promise.reject(err.errors[0].message);
  });
}

function deleteSet(set_num) {
  return Set.destroy({
    where: {
      set_num: set_num
    }
  })
  .then(result => {
    if (result === 0) {
      return Promise.reject("No set found to delete");
    }
    return Promise.resolve();
  })
  .catch(err => {
    return Promise.reject(err.errors[0].message);
  });
}

module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme, getAllThemes, addSet, editSet, deleteSet }
