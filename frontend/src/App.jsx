import React, { useState } from 'react';
import HomeScreen from './screens/HomeScreen';
import UploadScreen from './screens/UploadScreen';
import DiagnosticsScreen from './screens/DiagnosticsScreen';
import ChatScreen from './screens/ChatScreen';
import { diagnoseImage } from './services/api';

function App() {
  const [screen, setScreen] = useState('home');
  const [category, setCategory] = useState(null);
  const [skillLevel, setSkillLevel] = useState('intermediate');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [latestResult, setLatestResult] = useState(null);
  const [error, setError] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);

  const handleStart = (selectedCategory) => {
    setCategory(selectedCategory);
    setScreen('upload');
  };

  const handleAnalyze = async ({ imageFile, category, skillLevel, description, isVideoFrame }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await diagnoseImage({
        imageFile,
        category,
        skillLevel,
        description,
        isVideoFrame,
        conversationHistory: [],
      });
      setLatestResult(result);
      setScreen('diagnostics');
      if (result?.message) {
        setChatMessages(prev => [...prev, { role: 'ai', ...result, timestamp: new Date().toISOString() }]);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const tabStyle = (active) => ({
    flex: 1,
    padding: '12px 0',
    textAlign: 'center',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    color: active ? '#3b82f6' : '#94a3b8',
    borderBottom: active ? '2px solid #3b82f6' : '2px solid transparent',
    transition: 'all .15s',
  });

  const showTabs = screen === 'upload' || screen === 'diagnostics' || screen === 'chat';

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#08090b' }}>
      {screen === 'home' && <HomeScreen onStart={handleStart} />}

      {showTabs && (
        <>
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#0f1117' }}>
            <button style={tabStyle(screen === 'upload')} onClick={() => setScreen('upload')}>📷 Upload</button>
            <button style={tabStyle(screen === 'diagnostics')} onClick={() => setScreen('diagnostics')}>📋 Diagnostics</button>
            <button style={tabStyle(screen === 'chat')} onClick={() => setScreen('chat')}>💬 Chat</button>
          </div>

          {screen === 'upload' && (
            <UploadScreen
              category={category}
              skillLevel={skillLevel}
              setSkillLevel={setSkillLevel}
              description={description}
              setDescription={setDescription}
              onAnalyze={handleAnalyze}
              loading={loading}
              onBack={() => setScreen('home')}
            />
          )}
          {screen === 'diagnostics' && <DiagnosticsScreen latestResult={latestResult} />}
          {screen === 'chat' && (
            <ChatScreen
              messages={chatMessages}
              setMessages={setChatMessages}
              category={category}
              skillLevel={skillLevel}
              loading={chatLoading}
              setLoading={setChatLoading}
            />
          )}
        </>
      )}

      {error && (
        <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: '#7f1d1d', color: '#fff', padding: '10px 20px', borderRadius: 8, fontSize: 13 }}>
          {error}
        </div>
      )}
    </div>
  );
}

export default App;