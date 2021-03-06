// User model here
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const EMAIL_PATTERN = /^(([^<>()[\]\\.,;:\s@']+(\.[^<>()[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_PATTERN = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
const SALT_ROUNDS = 10

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: 'Please, provide an user name',
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: 'Please, provide a password',
      match: [PASSWORD_PATTERN, 'Invalid password (1 number, 1 uppercase, 1 lowercase, 8 character long)']
    },
    status: {
      type: String,
      enum: ['Pending Confirmation', 'Active'],
      default: 'Pending Confirmation'
    },
    confirmationCode: {
      type: String,
      default: () => {
        const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let token = '';
        for (let i = 0; i < 25; i++) {
            token += characters[Math.floor(Math.random() * characters.length )];
        }
        return token;
      }
    },
    email: {
      type: String,
      required: "Please, provide an email",
      unique: true,
      lowercase: true,
      match: [EMAIL_PATTERN, "Invalid email"],
      trim: true,
    }
  }
)

userSchema.methods.checkPassword = function (passwordToCheck) {
  return bcrypt.compare(passwordToCheck, this.password);
};

userSchema.pre('save', function(next) {
  if (this.isModified('password')) {
    bcrypt.hash(this.password, SALT_ROUNDS)
      .then(hash => {
        this.password = hash
        next()
      })
  } else {
    next()
  }
})

const User = mongoose.model('User', userSchema)
module.exports = User;