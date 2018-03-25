import * as mongoose from 'mongoose';

export interface IChatMessageModel extends mongoose.Document {
  message: string;
  user_id: mongoose.Schema.Types.ObjectId;
  username: string;
  avatar: string;
  channel_id: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new mongoose.Schema({
  message: { type: String, required: true, maxlength: 5000 },
  channel_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  username: { type: String, required: true },
  avatar: { type: String },
}, {
  timestamps: true,
});

messageSchema.index({ channel_id: 1, createdAt: 1 });

const ChatMessage: mongoose.Model<IChatMessageModel>
  = mongoose.model<IChatMessageModel>('ChatMessage', messageSchema);

export default ChatMessage;
