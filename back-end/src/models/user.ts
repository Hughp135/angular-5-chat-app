import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true },
});

const User = mongoose.model('User', UserSchema);

UserSchema.pre('save', async function (next) {
  if (!this.isNew) {
    return next();
  }
  const user = this;
  const userExists = await this.constructor.findOne({
    username: user.username
  }).lean();
  if (userExists) {
    const error = new Error('duplicate username');
    return next(error);
  }

  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) {
    return next();
  }
  try {
    user.password = await hashPassword(user.password);
    next();
  } catch (e) {
    next(e);
  }
});

function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        reject(err);
      }
      resolve(hash);
    });
  });
}

export default User;
