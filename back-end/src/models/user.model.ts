import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from 'shared-interfaces/user.interface';


export interface IUserModel extends mongoose.Document, User {
  // private properties only
  password: string;
  username_lowercase: string;
}

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  username_lowercase: { type: String },
  password: { type: String, required: true },
  socket_id: { type: String },
  joined_servers: { type: [String], default: [] },
  friends: { type: [String], default: [] },
  friend_requests: {
    type: [
      {
        type: { type: String, enum: ['outgoing', 'incoming'], required: true },
        user_id: { type: mongoose.Schema.Types.ObjectId, required: true },
      },
    ], default: [],
  },
});

UserSchema.index({ username_lowercase: 'text' });

UserSchema.pre('save', async function (next) {
  if (!this.isNew) {
    // Only hash password for newly created users
    return next();
  }
  const user = this;
  const existingUser = await this.constructor.findOne({
    username_lowercase: user.username.toLowerCase(),
  }).lean();

  if (existingUser) {
    const error = new Error('duplicate username');
    return next(error);
  }

  user.username_lowercase = user.username.toLowerCase();
  user.password = await hashPassword(user.password);
  next();
});

async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

const User: mongoose.Model<IUserModel>
  = mongoose.model<IUserModel>('User', UserSchema);

export default User;
