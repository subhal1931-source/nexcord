// Simple in-memory store - in production use a real DB like Supabase/Planetscale
let store = {
  users: [
    { id: 'user_1', username: 'CyberNova', email: 'nova@nexcord.app', password: 'demo123', avatar: 'CN', color: '#00f5ff', status: 'online', bio: 'Building the future 🚀' },
    { id: 'user_2', username: 'VoidWalker', email: 'void@nexcord.app', password: 'demo123', avatar: 'VW', color: '#bf5af2', status: 'idle', bio: 'Code. Sleep. Repeat.' },
    { id: 'user_3', username: 'NeonDrift', email: 'neon@nexcord.app', password: 'demo123', avatar: 'ND', color: '#ff375f', status: 'online', bio: 'Design is everything.' },
  ],
  servers: [
    {
      id: 'server_1',
      name: 'Cyber Lounge',
      icon: 'CL',
      color: '#00f5ff',
      description: 'A place for digital nomads and tech enthusiasts',
      ownerId: 'user_1',
      members: ['user_1', 'user_2', 'user_3'],
      channels: [
        { id: 'ch_1', name: 'general', type: 'text', serverId: 'server_1' },
        { id: 'ch_2', name: 'dev-talk', type: 'text', serverId: 'server_1' },
        { id: 'ch_3', name: 'off-topic', type: 'text', serverId: 'server_1' },
      ],
    },
    {
      id: 'server_2',
      name: 'Design Guild',
      icon: 'DG',
      color: '#bf5af2',
      description: 'Share your design work and get feedback',
      ownerId: 'user_3',
      members: ['user_1', 'user_2', 'user_3'],
      channels: [
        { id: 'ch_4', name: 'showcase', type: 'text', serverId: 'server_2' },
        { id: 'ch_5', name: 'feedback', type: 'text', serverId: 'server_2' },
      ],
    },
  ],
  messages: {
    ch_1: [
      { id: 'msg_1', channelId: 'ch_1', userId: 'user_1', content: 'Hey everyone! Welcome to Cyber Lounge 🚀', timestamp: Date.now() - 3600000 },
      { id: 'msg_2', channelId: 'ch_1', userId: 'user_2', content: 'Glad to be here! This place looks incredible', timestamp: Date.now() - 3000000 },
      { id: 'msg_3', channelId: 'ch_1', userId: 'user_3', content: 'Love the vibe here. Let\'s build something amazing together!', timestamp: Date.now() - 1800000 },
    ],
    ch_2: [
      { id: 'msg_4', channelId: 'ch_2', userId: 'user_2', content: 'Anyone using Next.js 14? App router is 🔥', timestamp: Date.now() - 900000 },
    ],
    ch_3: [],
    ch_4: [
      { id: 'msg_5', channelId: 'ch_4', userId: 'user_3', content: 'Just finished a new UI kit. Thoughts?', timestamp: Date.now() - 600000 },
    ],
    ch_5: [],
  },
  sessions: {},
};

export function getStore() {
  return store;
}

export function addMessage(channelId, message) {
  if (!store.messages[channelId]) store.messages[channelId] = [];
  store.messages[channelId].push(message);
}

export function addServer(server) {
  store.servers.push(server);
}

export function addChannel(channel) {
  const server = store.servers.find(s => s.id === channel.serverId);
  if (server) server.channels.push(channel);
  store.messages[channel.id] = [];
}

export function joinServer(serverId, userId) {
  const server = store.servers.find(s => s.id === serverId);
  if (server && !server.members.includes(userId)) {
    server.members.push(userId);
  }
}

export function addUser(user) {
  store.users.push(user);
}

export function setSession(token, userId) {
  store.sessions[token] = userId;
}

export function getSession(token) {
  return store.sessions[token];
}
