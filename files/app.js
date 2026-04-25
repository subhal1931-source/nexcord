import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const POLL_INTERVAL = 2000;

function Avatar({ initials, color, size = 36, status }) {
  return (
    <div style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: `${color}22`,
        border: `2px solid ${color}55`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: color, fontSize: size * 0.33, fontWeight: 700,
        fontFamily: "'Space Grotesk', sans-serif",
        flexShrink: 0,
      }}>{initials}</div>
      {status && (
        <div style={{
          position: 'absolute', bottom: 0, right: 0,
          width: size * 0.28, height: size * 0.28,
          borderRadius: '50%',
          background: status === 'online' ? '#30d158' : status === 'idle' ? '#ff9f0a' : '#8b949e',
          border: '2px solid #080b10',
        }} />
      )}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '420px', boxShadow: '0 0 60px rgba(0,0,0,0.8)', animation: 'popIn 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: '#f0f6fc' }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: '20px', lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function AppPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [servers, setServers] = useState([]);
  const [activeServer, setActiveServer] = useState(null);
  const [activeChannel, setActiveChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [modal, setModal] = useState(null);
  const [newServer, setNewServer] = useState({ name: '', description: '' });
  const [newChannel, setNewChannel] = useState('');
  const [discover, setDiscover] = useState(false);
  const [profilePanel, setProfilePanel] = useState(false);
  const [sending, setSending] = useState(false);
  const msgEndRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    const t = localStorage.getItem('token');
    const u = localStorage.getItem('user');
    if (!t || !u) { router.push('/'); return; }
    setToken(t);
    setUser(JSON.parse(u));
  }, []);

  const fetchServers = useCallback(async () => {
    if (!token) return;
    const res = await fetch('/api/servers?action=list', { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (Array.isArray(data)) setServers(data);
  }, [token]);

  useEffect(() => {
    if (token) fetchServers();
  }, [token, fetchServers]);

  const fetchMessages = useCallback(async () => {
    if (!token || !activeChannel) return;
    const res = await fetch(`/api/messages?channelId=${activeChannel.id}`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (Array.isArray(data)) setMessages(data);
  }, [token, activeChannel]);

  useEffect(() => {
    if (activeChannel) {
      fetchMessages();
      pollRef.current = setInterval(fetchMessages, POLL_INTERVAL);
    }
    return () => clearInterval(pollRef.current);
  }, [activeChannel, fetchMessages]);

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectServer = (server) => {
    setActiveServer(server);
    const firstCh = server.channels?.[0];
    setActiveChannel(firstCh || null);
    setMessages([]);
    setDiscover(false);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeChannel || sending) return;
    setSending(true);
    const res = await fetch(`/api/messages?channelId=${activeChannel.id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: input }),
    });
    setSending(false);
    if (res.ok) { setInput(''); fetchMessages(); }
  };

  const createServer = async () => {
    const res = await fetch('/api/servers?action=create', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(newServer),
    });
    if (res.ok) {
      const server = await res.json();
      setNewServer({ name: '', description: '' });
      setModal(null);
      await fetchServers();
      selectServer(server);
    }
  };

  const joinServer = async (serverId) => {
    await fetch('/api/servers?action=join', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ serverId }),
    });
    await fetchServers();
    setDiscover(false);
  };

  const addChannel = async () => {
    const res = await fetch('/api/servers?action=add-channel', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ serverId: activeServer.id, name: newChannel }),
    });
    if (res.ok) {
      setNewChannel('');
      setModal(null);
      await fetchServers();
    }
  };

  const logout = () => {
    localStorage.clear();
    router.push('/');
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (ts) => {
    const d = new Date(ts);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const myServers = servers.filter(s => s.isMember);
  const otherServers = servers.filter(s => !s.isMember);

  if (!user) return null;

  return (
    <>
      <Head>
        <title>Nexcord</title>
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </Head>

      <div style={{ display: 'flex', height: '100vh', background: '#080b10', overflow: 'hidden' }}>
        {/* Server Rail */}
        <div style={{ width: '72px', background: '#080b10', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 0', gap: '8px', borderRight: '1px solid #21262d', overflowY: 'auto', flexShrink: 0 }}>
          {/* Home */}
          <button onClick={() => { setActiveServer(null); setDiscover(false); setProfilePanel(false); }}
            title="Home"
            style={{
              width: '48px', height: '48px', borderRadius: activeServer === null && !discover ? '16px' : '50%',
              background: activeServer === null && !discover ? 'rgba(0,245,255,0.15)' : 'rgba(255,255,255,0.05)',
              border: activeServer === null && !discover ? '1px solid rgba(0,245,255,0.3)' : '1px solid #21262d',
              color: '#00f5ff', fontSize: '20px', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
              boxShadow: activeServer === null && !discover ? '0 0 15px rgba(0,245,255,0.2)' : 'none',
            }}>⚡</button>

          <div style={{ width: '32px', height: '1px', background: '#21262d', margin: '4px 0' }} />

          {myServers.map(server => (
            <button key={server.id} onClick={() => selectServer(server)}
              title={server.name}
              style={{
                width: '48px', height: '48px',
                borderRadius: activeServer?.id === server.id ? '16px' : '50%',
                background: activeServer?.id === server.id ? `${server.color}22` : 'rgba(255,255,255,0.05)',
                border: activeServer?.id === server.id ? `1px solid ${server.color}55` : '1px solid #21262d',
                color: server.color, fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                transition: 'all 0.2s', flexShrink: 0,
                boxShadow: activeServer?.id === server.id ? `0 0 15px ${server.color}33` : 'none',
              }}>{server.icon}</button>
          ))}

          <div style={{ width: '32px', height: '1px', background: '#21262d', margin: '4px 0' }} />

          {/* Create server */}
          <button onClick={() => setModal('create-server')}
            title="Create Server"
            style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(48,209,88,0.1)', border: '1px solid rgba(48,209,88,0.3)', color: '#30d158', fontSize: '22px', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}>+</button>

          {/* Discover */}
          <button onClick={() => { setDiscover(true); setActiveServer(null); }}
            title="Discover Servers"
            style={{ width: '48px', height: '48px', borderRadius: discover ? '16px' : '50%', background: discover ? 'rgba(191,90,242,0.15)' : 'rgba(255,255,255,0.05)', border: discover ? '1px solid rgba(191,90,242,0.3)' : '1px solid #21262d', color: '#bf5af2', fontSize: '18px', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}>🧭</button>
        </div>

        {/* Sidebar */}
        {activeServer && (
          <div style={{ width: '240px', background: '#0d1117', borderRight: '1px solid #21262d', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
            {/* Server header */}
            <div style={{ padding: '16px', borderBottom: '1px solid #21262d', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '15px', color: '#f0f6fc' }}>{activeServer.name}</div>
                <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '2px' }}>{activeServer.memberCount} members</div>
              </div>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${activeServer.color}22`, border: `1px solid ${activeServer.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: activeServer.color, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '12px' }}>{activeServer.icon}</div>
            </div>

            {/* Channels */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Channels</span>
                {activeServer.ownerId === user.id && (
                  <button onClick={() => setModal('add-channel')} style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: '0 4px' }}>+</button>
                )}
              </div>
              {activeServer.channels?.map(ch => (
                <button key={ch.id} onClick={() => setActiveChannel(ch)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    width: '100%', padding: '8px 10px', borderRadius: '8px', border: 'none',
                    background: activeChannel?.id === ch.id ? 'rgba(0,245,255,0.08)' : 'transparent',
                    color: activeChannel?.id === ch.id ? '#00f5ff' : '#8b949e',
                    cursor: 'pointer', textAlign: 'left', fontSize: '14px',
                    fontFamily: 'Inter, sans-serif', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (activeChannel?.id !== ch.id) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#f0f6fc'; } }}
                  onMouseLeave={e => { if (activeChannel?.id !== ch.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8b949e'; } }}
                >
                  <span style={{ color: '#484f58', fontSize: '15px' }}>#</span>
                  {ch.name}
                </button>
              ))}
            </div>

            {/* User area */}
            <div style={{ padding: '10px', borderTop: '1px solid #21262d', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button onClick={() => setProfilePanel(!profilePanel)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', flex: 1, padding: 0 }}>
                <Avatar initials={user.avatar} color={user.color} size={36} status="online" />
                <div style={{ textAlign: 'left', flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#f0f6fc', fontFamily: "'Space Grotesk', sans-serif", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.username}</div>
                  <div style={{ fontSize: '11px', color: '#30d158' }}>Online</div>
                </div>
              </button>
              <button onClick={logout} title="Logout" style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: '16px', padding: '4px', borderRadius: '6px' }}>⏻</button>
            </div>
          </div>
        )}

        {/* Main area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Home / No server selected */}
          {!activeServer && !discover && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px', padding: '40px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '60px', marginBottom: '16px' }}>⚡</div>
                <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '32px', fontWeight: 700, background: 'linear-gradient(135deg, #00f5ff, #bf5af2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 8px' }}>Welcome to Nexcord</h1>
                <p style={{ color: '#8b949e', fontSize: '16px', margin: 0 }}>Pick a server, create one, or discover new communities.</p>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <button onClick={() => setModal('create-server')} style={{ padding: '12px 24px', background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.3)', borderRadius: '10px', color: '#00f5ff', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, cursor: 'pointer', fontSize: '15px' }}>+ Create Server</button>
                <button onClick={() => setDiscover(true)} style={{ padding: '12px 24px', background: 'rgba(191,90,242,0.1)', border: '1px solid rgba(191,90,242,0.3)', borderRadius: '10px', color: '#bf5af2', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, cursor: 'pointer', fontSize: '15px' }}>🧭 Discover</button>
              </div>
            </div>
          )}

          {/* Discover */}
          {discover && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '24px', fontWeight: 700, color: '#f0f6fc', marginBottom: '8px' }}>Discover Servers</h2>
              <p style={{ color: '#8b949e', marginBottom: '28px' }}>Find communities to join</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {otherServers.map(server => (
                  <div key={server.id} style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: '14px', padding: '20px', transition: 'border-color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = `${server.color}44`}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#21262d'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${server.color}22`, border: `1px solid ${server.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: server.color, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '15px' }}>{server.icon}</div>
                      <div>
                        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '16px', color: '#f0f6fc' }}>{server.name}</div>
                        <div style={{ fontSize: '12px', color: '#8b949e' }}>{server.memberCount} members</div>
                      </div>
                    </div>
                    <p style={{ color: '#8b949e', fontSize: '13px', marginBottom: '16px', lineHeight: 1.5 }}>{server.description || 'A great community!'}</p>
                    <button onClick={() => joinServer(server.id)} style={{ width: '100%', padding: '9px', background: `${server.color}18`, border: `1px solid ${server.color}44`, borderRadius: '8px', color: server.color, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>Join Server</button>
                  </div>
                ))}
                {otherServers.length === 0 && <p style={{ color: '#8b949e' }}>No new servers to discover. Create one!</p>}
              </div>
            </div>
          )}

          {/* Chat area */}
          {activeServer && activeChannel && (
            <>
              {/* Channel header */}
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #21262d', display: 'flex', alignItems: 'center', gap: '10px', background: '#080b10', flexShrink: 0 }}>
                <span style={{ color: '#484f58', fontSize: '20px' }}>#</span>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '16px', color: '#f0f6fc' }}>{activeChannel.name}</span>
                <span style={{ color: '#484f58', fontSize: '14px', marginLeft: '8px' }}>in {activeServer.name}</span>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                {messages.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: '#8b949e' }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>👋</div>
                    <p>This is the start of <strong style={{ color: '#f0f6fc' }}>#{activeChannel.name}</strong></p>
                  </div>
                )}
                {messages.map((msg, i) => {
                  const prev = messages[i - 1];
                  const isGroup = prev && prev.userId === msg.userId && msg.timestamp - prev.timestamp < 300000;
                  const dateChanged = !prev || formatDate(msg.timestamp) !== formatDate(prev?.timestamp);
                  return (
                    <div key={msg.id}>
                      {dateChanged && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '16px 0' }}>
                          <div style={{ flex: 1, height: '1px', background: '#21262d' }} />
                          <span style={{ fontSize: '12px', color: '#8b949e', fontWeight: 600 }}>{formatDate(msg.timestamp)}</span>
                          <div style={{ flex: 1, height: '1px', background: '#21262d' }} />
                        </div>
                      )}
                      <div className="message-hover" style={{ display: 'flex', gap: '12px', padding: '4px 8px', marginBottom: isGroup ? '2px' : '8px' }}>
                        {!isGroup ? (
                          <Avatar initials={msg.avatar} color={msg.avatarColor} size={38} />
                        ) : (
                          <div style={{ width: '38px', flexShrink: 0 }} />
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {!isGroup && (
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '14px', color: msg.avatarColor }}>{msg.username}</span>
                              <span style={{ fontSize: '11px', color: '#484f58' }}>{formatTime(msg.timestamp)}</span>
                            </div>
                          )}
                          <p style={{ margin: 0, fontSize: '15px', color: '#d1d8e0', lineHeight: 1.6, wordBreak: 'break-word' }}>{msg.content}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={msgEndRef} />
              </div>

              {/* Input */}
              <div style={{ padding: '16px 20px', flexShrink: 0 }}>
                <form onSubmit={sendMessage} style={{ display: 'flex', gap: '12px', background: '#0d1117', border: '1px solid #21262d', borderRadius: '12px', padding: '10px 14px', alignItems: 'center' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,245,255,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#21262d'}
                >
                  <span style={{ color: '#484f58', fontSize: '18px' }}>#</span>
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder={`Message #${activeChannel.name}`}
                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#f0f6fc', fontSize: '15px', fontFamily: 'Inter, sans-serif' }}
                  />
                  <button type="submit" disabled={!input.trim() || sending}
                    style={{
                      background: input.trim() ? 'rgba(0,245,255,0.15)' : 'transparent',
                      border: `1px solid ${input.trim() ? 'rgba(0,245,255,0.3)' : '#21262d'}`,
                      borderRadius: '8px', padding: '6px 14px', color: input.trim() ? '#00f5ff' : '#484f58',
                      cursor: input.trim() ? 'pointer' : 'not-allowed', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: '13px', transition: 'all 0.2s',
                    }}>Send</button>
                </form>
              </div>
            </>
          )}

          {activeServer && !activeChannel && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b949e' }}>
              Select a channel to start chatting
            </div>
          )}
        </div>

        {/* Profile Panel */}
        {profilePanel && (
          <div style={{ width: '260px', background: '#0d1117', borderLeft: '1px solid #21262d', padding: '24px', flexShrink: 0, animation: 'slideIn 0.2s ease-out' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <Avatar initials={user.avatar} color={user.color} size={80} status="online" />
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '18px', color: '#f0f6fc', marginTop: '12px' }}>{user.username}</div>
              <div style={{ fontSize: '13px', color: '#8b949e', marginTop: '4px' }}>{user.email}</div>
            </div>
            <div style={{ background: '#080b10', border: '1px solid #21262d', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Bio</div>
              <div style={{ fontSize: '14px', color: '#d1d8e0' }}>{user.bio}</div>
            </div>
            <div style={{ background: '#080b10', border: '1px solid #21262d', borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Servers</div>
              {myServers.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: `${s.color}22`, border: `1px solid ${s.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, fontSize: '10px', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>{s.icon}</div>
                  <span style={{ fontSize: '13px', color: '#d1d8e0' }}>{s.name}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setProfilePanel(false)} style={{ width: '100%', marginTop: '16px', padding: '10px', background: 'transparent', border: '1px solid #21262d', borderRadius: '8px', color: '#8b949e', cursor: 'pointer', fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>Close</button>
          </div>
        )}
      </div>

      {/* Create Server Modal */}
      {modal === 'create-server' && (
        <Modal title="Create a Server" onClose={() => setModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#8b949e', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Server Name *</label>
              <input value={newServer.name} onChange={e => setNewServer({ ...newServer, name: e.target.value })}
                placeholder="My Awesome Server"
                style={{ width: '100%', background: '#080b10', border: '1px solid #21262d', borderRadius: '8px', padding: '10px 14px', color: '#f0f6fc', fontSize: '15px', outline: 'none', fontFamily: 'Inter, sans-serif' }}
                onFocus={e => e.target.style.borderColor = 'rgba(0,245,255,0.4)'}
                onBlur={e => e.target.style.borderColor = '#21262d'}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#8b949e', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Description</label>
              <input value={newServer.description} onChange={e => setNewServer({ ...newServer, description: e.target.value })}
                placeholder="What's this server about?"
                style={{ width: '100%', background: '#080b10', border: '1px solid #21262d', borderRadius: '8px', padding: '10px 14px', color: '#f0f6fc', fontSize: '15px', outline: 'none', fontFamily: 'Inter, sans-serif' }}
                onFocus={e => e.target.style.borderColor = 'rgba(0,245,255,0.4)'}
                onBlur={e => e.target.style.borderColor = '#21262d'}
              />
            </div>
            <button onClick={createServer} disabled={!newServer.name.trim()}
              style={{ padding: '12px', background: newServer.name.trim() ? 'rgba(0,245,255,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${newServer.name.trim() ? 'rgba(0,245,255,0.3)' : '#21262d'}`, borderRadius: '8px', color: newServer.name.trim() ? '#00f5ff' : '#8b949e', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '15px', cursor: newServer.name.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}>
              Create Server
            </button>
          </div>
        </Modal>
      )}

      {/* Add Channel Modal */}
      {modal === 'add-channel' && (
        <Modal title="Add Channel" onClose={() => setModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#8b949e', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Channel Name</label>
              <input value={newChannel} onChange={e => setNewChannel(e.target.value)}
                placeholder="new-channel"
                style={{ width: '100%', background: '#080b10', border: '1px solid #21262d', borderRadius: '8px', padding: '10px 14px', color: '#f0f6fc', fontSize: '15px', outline: 'none', fontFamily: 'Inter, sans-serif' }}
                onFocus={e => e.target.style.borderColor = 'rgba(0,245,255,0.4)'}
                onBlur={e => e.target.style.borderColor = '#21262d'}
              />
            </div>
            <button onClick={addChannel} disabled={!newChannel.trim()}
              style={{ padding: '12px', background: newChannel.trim() ? 'rgba(0,245,255,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${newChannel.trim() ? 'rgba(0,245,255,0.3)' : '#21262d'}`, borderRadius: '8px', color: newChannel.trim() ? '#00f5ff' : '#8b949e', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '15px', cursor: newChannel.trim() ? 'pointer' : 'not-allowed' }}>
              Add Channel
            </button>
          </div>
        </Modal>
      )}

      <style>{`
        @keyframes popIn { from { transform: scale(0.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes slideIn { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .message-hover:hover { background: rgba(255,255,255,0.02); border-radius: 8px; }
        input::placeholder { color: #484f58; }
        * { box-sizing: border-box; }
      `}</style>
    </>
  );
}
