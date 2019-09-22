import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function(next) {
  const hash = await bcrypt.hash(this.password, 8);
  this.password = hash;

  next();
});

UserSchema.methods.checkPassword = async password => {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model('User', UserSchema);
