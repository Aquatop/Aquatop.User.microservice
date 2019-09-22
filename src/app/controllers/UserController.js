import * as Yup from 'yup';
import User from '../schemas/User';

class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6),
    });

    if (!(await schema.isValid(req.body))) {
      return res
        .status(400)
        .json({ error: 'Body of request out of expected format!' });
    }

    const userExists = await User.findOne({ email: req.body.email });

    if (userExists) {
      return res.status(400).json({ error: 'Email already in use!' });
    }

    const { id, name, email } = await User.create(req.body);

    return res.json({ id, name, email });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) => {
          return oldPassword ? field.required() : field;
        }),
      confirmPassword: Yup.string().when('password', (password, field) => {
        return password ? field.required().oneOf([Yup.ref('password')]) : field;
      }),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails!' });
    }

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
