import User from '../schemas/User';

class UserController {
  async store(req, res) {
    const userExists = await User.findOne({ email: req.body.email });

    if (userExists) {
      return res.status(400).json({ error: 'Email already in use!' });
    }

    const { id, name, email } = await User.create(req.body);

    return res.json({ id, name, email });
  }

  async update(req, res) {
    const id = req.userId;
    const { email, oldPassword, password, name } = req.body;

    const user = await User.findById(id);

    if (email && user.email !== email) {
      const userExists = await User.findOne({ email });

      if (userExists) {
        return res.status(400).json({ error: 'Email already in use!' });
      }

      user.email = email;
    }

    if (oldPassword) {
      if (!(await user.checkPassword(oldPassword))) {
        return res.status(401).json({ error: 'Password does not match!' });
      }

      user.password = password;
    }

    if (name) {
      user.name = name;
    }

    user.save();

    return res.json(user.toJSON());
  }
}

export default new UserController();
