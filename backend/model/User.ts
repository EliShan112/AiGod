import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { Document } from "mongoose";

export interface IUser extends Document {
    email: string;
    username: string;
    password: string;
    refreshTokens: string[];
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema <IUser> = new Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    username: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    refreshTokens:{
        type: [String],
        default: []
    }
},{timestamps: true})

UserSchema.pre("save", async function (next){
    if(!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt)

    next();
});

UserSchema.methods.comparePassword = async function (candidatePassword: string){
    return bcrypt.compare(candidatePassword, this.password);
}

export const User = mongoose.model<IUser>("User", UserSchema);
