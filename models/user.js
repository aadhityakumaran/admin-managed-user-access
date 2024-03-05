import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    _id: Number,
    password: {
        type: String,
        required: true,
        set: password => bcrypt.hashSync(password, 12)
    },
    name: {
        type: String,
        default: '-'
    },
    update: { 
        type: Boolean, 
        default: false
    }
});

const User = mongoose.model('user', userSchema);

export default User;