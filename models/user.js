const Sequelize = require(`sequelize`);

module.exports = (db) => {
  return db.define(
    `user`,
    {
      user_uid: {
        type: Sequelize.UUIDV4,
        primaryKey: true,
        defaultValue: Sequelize.UUIDv4
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: true
      },
      fullname: {
        type: Sequelize.STRING,
        allowNull: true
      },
      validdate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      statusid: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      createdate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createby: {
        type: Sequelize.STRING,
        allowNull: true
      }
    },
    {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false
    }
  );
};
