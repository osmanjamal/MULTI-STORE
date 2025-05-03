const bcrypt = require('bcryptjs');
const User = require('../../models/user');
const tokenService = require('./tokenService');
const { AuthenticationError } = require('../../utils/errors');

exports.register = async (userData) => {
  const { email, password, name } = userData;
  const userExists = await User.findByEmail(email);
  if (userExists) throw new AuthenticationError('المستخدم مسجل مسبقاً');
  const user = await User.create({ email, password, name });
  const token = tokenService.generateToken(user.id);
  return { user, token };
};

exports.login = async (email, password) => {
  const user = await User.findByEmail(email);
  if (!user) throw new AuthenticationError('بيانات الاعتماد غير صحيحة');
  const isMatch = await User.comparePassword(password, user.password);
  if (!isMatch) throw new AuthenticationError('بيانات الاعتماد غير صحيحة');
  const token = tokenService.generateToken(user.id);
  return { user, token };
};

exports.logout = async (token) => {
  await tokenService.invalidateToken(token);
  return true;
};