import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true },
});

UserSchema.pre('save', function (next) {
  const user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) {
    return next();
  }

  bcrypt.hash(user.password, 10, (err, hash) => {
    if (err) { return next(err); }
    user.password = hash;
    next();
  });
});

export default mongoose.model('User', UserSchema);
