import mongoose, { Schema, Document } from 'mongoose';

export interface ILog extends Document {
    action: string;
    userId: string;
    details: Record<string, any>;
    timestamp: Date;
}

const LogSchema: Schema = new Schema({
    action: { type: String, required: true },
    userId: { type: String, required: true }, // ID do usuário no Postgres
    details: { type: Schema.Types.Mixed }, // Objeto flexível para detalhes
    timestamp: { type: Date, default: Date.now },
});

export default mongoose.model<ILog>('Log', LogSchema);
