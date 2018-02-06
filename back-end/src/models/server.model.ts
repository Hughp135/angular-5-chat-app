import * as mongoose from 'mongoose';

const serverSchema = new mongoose.Schema({
  name: { type: String, required: true, index: { unique: true } },
  owner_id: { type: mongoose.Schema.Types.ObjectId, required: true },
});

const Server = mongoose.model('Server', serverSchema);

export default Server;
