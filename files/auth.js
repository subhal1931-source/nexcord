import { getStore, addUser, setSession } from '../../lib/store';
import { v4 as uuidv4 } from 'uuid';

export default function handler(req, res) {
  const { action } = req.query;
  const store = getStore();

  if (action === 'login' && req.method === 'POST') {
    const { email, password } = req.body;
    const user = store.users.find(u => u.email === email && u.password === password);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const token = uuidv4();
    setSession(token, user.id);
    const { password: _, ...safeUser } = user;
    return res.json({ token, user: safeUser });
  }

  if (action === 'register' && req.method === 'POST') {
    const { username, email, password } = req.body;
    if (store.users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    const colors = ['#00f5ff', '#bf5af2', '#ff375f', '#30d158', '#ff9f0a', '#0a84ff'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const initials = username.slice(0, 2).toUpperCase();
    const user = {
      id: 'user_' + uuidv4().slice(0, 8),
      username,
      email,
      password,
      avatar: initials,
      color,
      status: 'online',
      bio: 'New to Nexcord!',
    };
    addUser(user);
    const token = uuidv4();
    setSession(token, user.id);
    const { password: _, ...safeUser } = user;
    return res.json({ token, user: safeUser });
  }

  return res.status(404).json({ error: 'Not found' });
}
