import { getStore, addMessage, getSession } from '../../lib/store';
import { v4 as uuidv4 } from 'uuid';

function getUser(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  const userId = getSession(token);
  if (!userId) return null;
  return getStore().users.find(u => u.id === userId);
}

export default function handler(req, res) {
  const { channelId } = req.query;
  const store = getStore();
  const user = getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const msgs = store.messages[channelId] || [];
    const enriched = msgs.map(m => {
      const u = store.users.find(u => u.id === m.userId);
      return { ...m, username: u?.username, avatar: u?.avatar, avatarColor: u?.color };
    });
    return res.json(enriched);
  }

  if (req.method === 'POST') {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Empty message' });
    const message = {
      id: 'msg_' + uuidv4().slice(0, 8),
      channelId,
      userId: user.id,
      content: content.trim(),
      timestamp: Date.now(),
    };
    addMessage(channelId, message);
    return res.json({ ...message, username: user.username, avatar: user.avatar, avatarColor: user.color });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
