const User = require('./../models/userModel');

// make sure tjhat at least one admin exists in database.
// use it for new databases.
exports.verifyAdminUser = async () => {
  const user = await User.findOne({ role: 'admin' });
  console.log('admin', user);

  if (!user) {
    await User.create({
      name: 'admin',
      email: 'admin@admin.com',
      password: 'admin12345',
      passwordConfirm: 'admin12345',
      role: 'admin'
    });
  }
};
