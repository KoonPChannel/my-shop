import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCredit } from '../api/api';
import './TopUp.css';

function TopUp() {
  const { token, user } = useAuth();
  const [link, setLink] = useState('');
  const [checking, setChecking] = useState(false);
  const [popup, setPopup] = useState(null);
  const pollRef = useRef(null);
  const prevCreditRef = useRef(null);

  const startPolling = () => {
    if (!token) {
      setPopup({ type: 'error', message: 'กรุณาเข้าสู่ระบบก่อน' });
      return;
    }
    setChecking(true);
    prevCreditRef.current = user?.credit ?? 0;

    let count = 0;
    pollRef.current = setInterval(async () => {
      count++;
      try {
        const data = await getCredit(token);
        const newCredit = data.credit;
        if (prevCreditRef.current !== null && newCredit > prevCreditRef.current) {
          setPopup({ type: 'success', message: `✅ เงินเข้าเรียบร้อย! เครดิตปัจจุบัน: ${newCredit}` });
          stopPolling();
        }
      } catch (e) {
        console.error('เช็คเครดิตผิดพลาด', e);
      }
      if (count >= 24) {
        stopPolling();
        setPopup({ type: 'error', message: 'หมดเวลาการตรวจสอบ หากยังไม่ได้รับเครดิต กรุณาติดต่อแอดมิน' });
      }
    }, 5000);
  };

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    setChecking(false);
  };

  useEffect(() => {
    return () => stopPolling();
  }, []);

  const simulatePayment = async () => {
    if (!token) return;
    try {
      const base = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${base}/topups`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.credit !== undefined) {
        setPopup({ type: 'success', message: `🧪 จำลองเงินเข้าแล้ว! เครดิตใหม่: ${data.credit}` });
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <section className="topup" id="topup">
      <div className="container">
        <h2 className="section-title">เติมเงิน</h2>
        <p className="section-subtitle">วางลิงก์จาก TrueMoney แล้วกดตรวจสอบเงินเข้า</p>

        {/* Input row */}
        <div className="topup-input-row">
          <div className="link-input-group">
            <label htmlFor="truemoney-link">ลิงก์อั่งเป้า TrueMoney</label>
            <input
              id="truemoney-link"
              type="text"
              placeholder="https://truemoney.com/red-envelope/..."
              value={link}
              onChange={e => setLink(e.target.value)}
            />
          </div>
          <button
            className="red-envelope-btn"
            onClick={() => {
              if (link) {
                window.open(link, '_blank', 'noopener,noreferrer');
                setTimeout(() => startPolling(), 3000);
              }
            }}
          >
            <span className="envelope-icon">🧧</span>
            <span>เติมเงิน</span>
          </button>
        </div>

        {/* Confirm button below input */}
        <div className="check-button-wrapper">
          <button
            className="btn-check"
            onClick={startPolling}
            disabled={checking || !token}
          >
            {checking ? '⏳ กำลังตรวจสอบเครดิต...' : '✅ ยืนยันการเติมเงิน'}
          </button>
        </div>

        {/* Popup */}
        {popup && (
          <div className={`popup-overlay ${popup.type}`}>
            <div className="popup-box">
              <p>{popup.message}</p>
              <button onClick={() => setPopup(null)}>ตกลง</button>
            </div>
          </div>
        )}

        {/* Simulate button (dev) */}
        {token && (
          <button className="btn-simulate" onClick={simulatePayment}>
            🧪 จำลองเงินเข้า (+500 credits)
          </button>
        )}
      </div>
    </section>
  );
}

export default TopUp;
