const jwt = require('jsonwebtoken');
const { pool } = require('../../config/database');
const appConfig = require('../../config/app');

exports.generateToken = (userId) => {
  return jwt.sign({ id: userId }, appConfig.security.jwtSecret, {
    expiresIn: appConfig.security.jwtExpire
  });
};

exports.verifyToken = (token) => {
  return jwt.verify(token, appConfig.security.jwtSecret);
};

exports.invalidateToken = async (token) => {
  await pool.query(
    `INSERT INTO blacklisted_tokens (token, expires_at)
     VALUES ($1, NOW() + INTERVAL '${appConfig.security.jwtExpire}')`,
    [token]
  );
  return true;
};