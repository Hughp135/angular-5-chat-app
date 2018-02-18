import * as mongoose from 'mongoose';

export interface IServerModel extends mongoose.Document {
  name: string;
  owner_id: mongoose.Schema.Types.ObjectId;
}

const serverSchema = new mongoose.Schema({
  name: { type: String, required: true, index: { unique: true } },
  owner_id: { type: mongoose.Schema.Types.ObjectId, required: true },
});

const Server: mongoose.Model<IServerModel> = mongoose.model<IServerModel>('Server', serverSchema);
export default Server;
