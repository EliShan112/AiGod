import mongoose, { Document } from "mongoose";

interface IMessageSchema{
    role: string;
    content: string;
    timestamp: Date;
}

interface IThreadSchema extends Document {
    threadId: string;
    title: string;
    messages: IMessageSchema[];
    createdAt: Date;
    updatedAt: Date;
}


const MessageSchema = new mongoose.Schema<IMessageSchema>({
    role: {
        type: String,
        enum: ["user", "assistant"],
        required: true
    },

    content: {
        type: String,
        required: true
    },

    timestamp: {
        type: Date,
        default: Date.now
    }
});

const ThreadSchema = new mongoose.Schema<IThreadSchema>({
    threadId: {
        type: String,
        required: true,
        unique: true
    },

    title: {
        type: String,
        default: "New Chat"
    },
    messages: [MessageSchema]
},
{timestamps: true}
);


export default mongoose.model<IThreadSchema>("Thread", ThreadSchema);