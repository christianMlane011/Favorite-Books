const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    trim: true,
    validate(value) {
      if (value.toLowerCase().includes('password')) {
        return new Error('Passowrd cannot include the word password');
      };
    }
  },
  books: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book'
  }]
});

userSchema.pre('save', async function (next) {
  const user = this;

  if (user.isModified('password')){
    user.password = await bcrypt.hash(user.password, 10);
  };

  next();
});

userSchema.methods.createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: 3 * 24 * 60 * 60 // 3 days
  });
};

userSchema.statics.checkCredentials = async (username, password) => {
  const user = await User.findOne({ username });

  if (!user) {
    throw new Error('User not found');
  };

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw new Error('Could not login')
  };

  return user;
};

userSchema.methods.toJSON = function() {
  const user = this;

  const userObject = user.toObject();

  delete userObject.password;
  return userObject;
}

const User = mongoose.model('User', userSchema);

module.exports = {
  User
};