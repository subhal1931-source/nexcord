import { getStore, addServer, addChannel, joinServer, getSession } from '../../lib/store';
import { v4 as uuidv4 } from 'uuid';

function getUser(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  const userId = getSession(token);
  if (!userId) return null;
  return getStore().users.find(u => u.id === userId);
}

export default function handler(req, res) {
  const { action } = req.query;
  const store = getStore();
  const user = getUser(req);

  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (action === 'list' && req.method === 'GET') {
    const servers = store.servers.map(s => ({
      ...s,
      memberCount: s.members.length,
      isMember: s.members.includes(user.id),
    }));
    return res.json(servers);
  }

  if (action === 'create' && req.method === 'POST') {
    const { name, description } = req.body;
    const colors = ['#00f5ff', '#bf5af2', '#ff375f', '#30d158', '#ff9f0a', '#0a84ff'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const server = {
      id: 'server_' + uuidv4().slice(0, 8),
      name,
      icon: name.slice(0, 2).toUpperCase(),
      color,
      description: description || '',
      ownerId: user.id,
      members: [user.id],
      channels: [],
    };
    const generalChannel = {
      id: 'ch_' + uuidv4().slice(0, 8),
      name: 'general',
      type: 'text',
      serverId: server.id,
    };
    server.channels.push(generalChannel);
    addServer(server);
    store.messages[generalChannel.id] = [];
    return res.json(server);
  }

  if (action === 'join' && req.method === 'POST') {
    const { serverId } = req.body;
    joinServer(serverId, user.id);
    return res.json({ success: true });
  }

  if (action === 'add-channel' && req.method === 'POST') {
    const { serverId, name } = req.body;
    const server = store.servers.find(s => s.id === serverId);
    if (!server || server.ownerId !== user.id) {
      return res.status(403).json({ error: 'Not allowed' });
    }
    const channel = {
      id: 'ch_' + uuidv4().slice(0, 8),
      name: name.toLowerCase().replace(/\s+/g, '-'),
      type: 'text',
      serverId,
    };
    addChannel(channel);
    return res.json(channel);
  }

  return res.status(404).json({ error: 'Not found' });
}
