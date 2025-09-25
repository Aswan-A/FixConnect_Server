import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber:{type:Number,required:true},
  isPro:{type:Boolean,default:false}
});

const User = mongoose.model('User', userSchema, 'User');
export default User;
