import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';

export interface IUserModel extends mongoose.Document {
  username: string;
  password: string;
  joinedServers: [mongoose.Types.ObjectId];
}

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true },
  joinedServers: { type: [ mongoose.Schema.Types.ObjectId ] },
});

UserSchema.pre('save', async function (next) {
  if (!this.isNew) {
    // Only hash password for newly created users
    return next();
  }
  const user = this;
  const existingUser = await this.constructor.findOne({
    username: user.username
  }).lean();

  if (existingUser) {
    const error = new Error('duplicate username');
    return next(error);
  }

  user.password = await hashPassword(user.password);
  next();
});

async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

const User: mongoose.Model<IUserModel>
  = mongoose.model<IUserModel>('User', UserSchema);

export default User;
