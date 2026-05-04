const { Sequelize } = require('sequelize');

const url = process.env.DATABASE_URL;

if (!url) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const sequelize = new Sequelize(url, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false }
  },
  pool: { max: 10, min: 0, acquire: 30000, idle: 10000 }
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Velora DB متصلة');
    await sequelize.sync({ alter: true });
    console.log('✅ جاهزة الجداول');
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
