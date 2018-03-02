import * as mongoose from 'mongoose';

export interface IServerModel extends mongoose.Document {
  name: string;
  owner_id: mongoose.Schema.Types.ObjectId;
  image_url: string;
}

const serverSchema = new mongoose.Schema({
  name: { type: String, required: true, maxLength: 40, minLength: 3 },
  owner_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  image_url: { type: String },
}, {
    timestamps: true,
  });

serverSchema.index({ name: 1, owner_id: 1 }, { unique: true });

const Server: mongoose.Model<IServerModel> = mongoose.model<IServerModel>('Server', serverSchema);
export default Server;
