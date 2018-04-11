import * as mongoose from 'mongoose';
import { ObjectId } from 'bson';

const mongooseDelete = require('mongoose-delete');

export interface IServerModel extends mongoose.Document {
  name: string;
  owner_id: mongoose.Schema.Types.ObjectId;
  image_url: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  deleted: boolean;

  delete: () => {};
}

const serverSchema = new mongoose.Schema({
  name: { type: String, required: true, maxLength: 40, minLength: 3 },
  owner_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  image_url: { type: String },
}, {
    timestamps: true,
  });

serverSchema.index({ name: 1, owner_id: 1 }, { unique: true });

serverSchema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' });

const Server: mongoose.Model<IServerModel> = mongoose.model<IServerModel>('Server', serverSchema);
export default Server;
