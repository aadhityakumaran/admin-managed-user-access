import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    user: String,
    password: {
        type: String,
        required: true,
        set: password => bcrypt.hashSync(password, 12)
    },
});

const Admin = mongoose.model('admin', adminSchema);

export default Admin;