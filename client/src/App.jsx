import { useState, useRef, useEffect } from 'react';

function App() {
  const [statusMessage, setStatusMessage] = useState('');
  const [statusColor, setStatusColor] = useState('var(--primary-color)');
  const pollIntervalRef = useRef(null);

  const cleanupPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => cleanupPolling();
  }, []);

  const triggerShutdown = async () => {
    if (!confirm('确定要关机吗？请确保你已经进行了警告且警告无效')) return;

    setStatusMessage('正在关机...');
    setStatusColor('var(--primary-color)');

    try {
      const res = await fetch('/api/shutdown', { method: 'POST' });
      const data = await res.json();
      setStatusMessage(data.message || '关机命令已发送。');
    } catch (err) {
      setStatusMessage('发送关机命令失败。');
      setStatusColor('var(--danger-color)');
      console.error(err);
    }
  };

  const sendWarning = async () => {
    cleanupPolling();

    setStatusMessage('正在发送警告...');
    setStatusColor('var(--primary-color)');

    try {
      const res = await fetch('/api/notify', { method: 'POST' });
      const data = await res.json();
      setStatusMessage(data.message || '警告已发送，等待回复...');

      // Start polling
      let attempts = 0;
      pollIntervalRef.current = setInterval(async () => {
        attempts++;
        if (attempts > 5) {
          cleanupPolling();
          setStatusMessage('等待超时 (无响应)');
          setStatusColor('orange');
          return;
        }

        try {
          const statusRes = await fetch('/api/status');
          const statusData = await statusRes.json();

          if (statusData.state === 'acknowledged') {
            setStatusMessage('✅对方已收到');
            setStatusColor('green');
            cleanupPolling();
          } else if (statusData.state === 'dismissed') {
            setStatusMessage('❌通知被关闭或忽略');
            setStatusColor('orange');
            cleanupPolling();
          } else if (statusData.state === 'timeout') {
            setStatusMessage('⌛通知超时');
            cleanupPolling();
          }
        } catch (e) {
          console.error('Status poll error:', e);
        }
      }, 2000);

    } catch (err) {
      setStatusMessage('发送警告失败。');
      setStatusColor('var(--danger-color)');
      console.error(err);
    }
  };

  return (
    <>
      <h1>一键睡觉关机警告</h1>

      <div className="container">
        <button className="shutdown-btn" onClick={triggerShutdown}>
          🛑 关机 (10s)
        </button>
        <button className="warning-btn" onClick={sendWarning}>
          ⚠️ 发送警告
        </button>
      </div>

      <div className="status" style={{ color: statusColor }}>
        {statusMessage}
      </div>
    </>
  );
}

export default App;
