import mongoose from 'mongoose';

const proUserSchema = new mongoose.Schema({
  occupation:String,
  skill:[{ type: String }],
  Degee:String,
  certifications:[{type:String}],
    description:{type:String}
});

const proUser = mongoose.model('User', proUserSchema, 'User');
export default proUser;
