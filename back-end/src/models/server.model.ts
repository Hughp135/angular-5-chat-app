import * as mongoose from 'mongoose';

export interface IServerModel extends mongoose.Document {
  name: string;
  owner_id: mongoose.Schema.Types.ObjectId;
}

const serverSchema = new mongoose.Schema({
  name: { type: String, required: true, maxLength: 40, minLength: 3 },
  owner_id: { type: mongoose.Schema.Types.ObjectId, required: true },
});

serverSchema.index({ name: 1, owner_id: 1 });

const Server: mongoose.Model<IServerModel> = mongoose.model<IServerModel>('Server', serverSchema);
export default Server;
