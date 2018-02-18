import * as mongoose from 'mongoose';

export interface IServerModel extends mongoose.Document {
  name: string;
  owner_id: mongoose.Schema.Types.ObjectId;
  users: Array<{
    user_id: string;
  }>;
}

const serverSchema = new mongoose.Schema({
  name: { type: String, required: true, index: { unique: true } },
  owner_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  users: {
    type: [{ user_id: { type: String, required: true } }], default: []
  }
});

const Server: mongoose.Model<IServerModel> = mongoose.model<IServerModel>('Server', serverSchema);
export default Server;
