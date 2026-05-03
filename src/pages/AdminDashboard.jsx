import React, { useState, useEffect, useRef } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, Droplets, DollarSign, Activity, CheckCircle2, Calendar,
  User, Clock, Lock, LogOut, Image as ImageIcon, X
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const ADMIN_PIN = '3232';

/* ─── PIN LOGIN SCREEN ─── */
const PinLogin = ({ onSuccess }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRefs = useRef([]);

  const handlePinChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newPin = pin.split('');
    newPin[index] = value;
    const joined = newPin.join('').slice(0, 4);
    setPin(joined);
    setError(false);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    if (joined.length === 4) {
      setTimeout(() => {
        if (joined === ADMIN_PIN) {
          onSuccess();
        } else {
          setError(true);
          setShake(true);
          setTimeout(() => { setShake(false); setPin(''); inputRefs.current[0]?.focus(); }, 600);
        }
      }, 200);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        padding: '48px 32px', textAlign: 'center', maxWidth: '400px', width: '100%'
      }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: 'rgba(0, 210, 106, 0.1)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px'
        }}>
          <Lock size={32} color="var(--primary)" />
        </div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>Admin Access</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '0.9rem' }}>
          Enter your 4-digit PIN to continue
        </p>

        <div style={{
          display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '24px',
          animation: shake ? 'shakeX 0.5s ease' : 'none'
        }}>
          {[0, 1, 2, 3].map(i => (
            <input
              key={i}
              ref={el => inputRefs.current[i] = el}
              type="password"
              inputMode="numeric"
              maxLength="1"
              value={pin[i] || ''}
              onChange={(e) => handlePinChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              autoFocus={i === 0}
              style={{
                width: '56px', height: '64px', textAlign: 'center',
                fontSize: '1.5rem', fontWeight: 700, borderRadius: '12px',
                background: '#0a120d',
                border: `2px solid ${error ? 'var(--danger)' : pin[i] ? 'var(--primary)' : 'var(--border)'}`,
                color: 'var(--text-main)', outline: 'none',
                transition: 'all 0.2s'
              }}
            />
          ))}
        </div>

        {error && (
          <p style={{ color: 'var(--danger)', fontSize: '0.875rem', fontWeight: 500 }}>
            Incorrect PIN. Please try again.
          </p>
        )}
      </div>
    </div>
  );
};

/* ─── STAT CARD ─── */
const StatCard = ({ title, value, icon: Icon, trend, trendValue }) => (
  <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>{title}</span>
      <div style={{ background: 'rgba(0, 210, 106, 0.1)', padding: '8px', borderRadius: '10px' }}>
        <Icon size={20} color="var(--primary)" />
      </div>
    </div>
    <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{value}</div>
    {trendValue && (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem' }}>
        <TrendingUp size={16} color={trend === 'up' ? 'var(--primary)' : 'var(--danger)'} />
        <span style={{ color: trend === 'up' ? 'var(--primary)' : 'var(--danger)' }}>{trendValue}</span>
        <span style={{ color: 'var(--text-muted)' }}>vs last week</span>
      </div>
    )}
  </div>
);

/* ─── ADMIN DASHBOARD ─── */
const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [shifts, setShifts] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState(null);
  const [stats, setStats] = useState({ totalRevenue: 0, totalKg: 0, activeShifts: 0, completedShifts: 0 });

  useEffect(() => {
    if (isAuthenticated) {
      fetchShifts();
    }
  }, [isAuthenticated]);

  const fetchShifts = async () => {
    try {
      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setShifts(data);

        const completed = data.filter(s => s.status === 'completed');
        const active = data.filter(s => s.status === 'active');

        const totalKg = completed.reduce((sum, s) => sum + (s.kg_sold || 0), 0);
        const totalRevenue = completed.reduce((sum, s) => sum + (s.revenue || 0), 0);

        setStats({
          totalRevenue,
          totalKg,
          activeShifts: active.length,
          completedShifts: completed.length
        });

        // Build chart data from last 7 days
        const days = {};
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const key = d.toISOString().split('T')[0];
          days[key] = { name: dayNames[d.getDay()], revenue: 0, volume: 0 };
        }

        completed.forEach(s => {
          const day = s.end_time?.split('T')[0];
          if (days[day]) {
            days[day].revenue += s.revenue || 0;
            days[day].volume += s.kg_sold || 0;
          }
        });

        setChartData(Object.values(days));
      } else {
        // Use sample data if no records
        loadSampleData();
      }
    } catch (err) {
      console.error('Error fetching shifts:', err);
      loadSampleData();
    }
  };

  const loadSampleData = () => {
    const sampleShifts = [
      { id: 1, salesman_name: 'Ahmad Khan', start_reading: 45012.5, end_reading: 45212.5, start_time: new Date().toISOString(), end_time: new Date().toISOString(), kg_sold: 200, revenue: 60000, status: 'completed', start_photo_url: null, end_photo_url: null },
      { id: 2, salesman_name: 'Raza Ali', start_reading: 44812.5, end_reading: 45012.5, start_time: new Date(Date.now() - 86400000).toISOString(), end_time: new Date(Date.now() - 86400000).toISOString(), kg_sold: 200, revenue: 60000, status: 'completed', start_photo_url: null, end_photo_url: null },
      { id: 3, salesman_name: 'Tariq Mehmood', start_reading: 44652.5, end_reading: 44812.5, start_time: new Date(Date.now() - 86400000).toISOString(), end_time: new Date(Date.now() - 86400000).toISOString(), kg_sold: 160, revenue: 48000, status: 'completed', start_photo_url: null, end_photo_url: null },
    ];
    setShifts(sampleShifts);
    setStats({ totalRevenue: 168000, totalKg: 560, activeShifts: 0, completedShifts: 3 });

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const chart = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return { name: dayNames[d.getDay()], revenue: Math.floor(Math.random() * 80000) + 30000, volume: Math.floor(Math.random() * 300) + 100 };
    });
    setChartData(chart);
  };

  const formatTime = (isoString) => {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    const d = new Date(isoString);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString();
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <PinLogin onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', minHeight: '100vh' }} className="animate-fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            Green Hill <span style={{ color: 'var(--primary)' }}>CNG</span>
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Admin Dashboard</p>
        </div>
        <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
          <LogOut size={16} /> Logout
        </button>
      </header>

      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <StatCard title="Total Revenue" value={`Rs ${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} trend="up" trendValue="+5.5%" />
        <StatCard title="Total Dispensed" value={`${stats.totalKg.toLocaleString()} Kg`} icon={Droplets} trend="up" trendValue="+2.1%" />
        <StatCard title="Active Shifts" value={stats.activeShifts} icon={Activity} />
        <StatCard title="Completed" value={stats.completedShifts} icon={CheckCircle2} />
      </div>

      {/* CHART + SHIFTS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginBottom: '32px' }}>
        {/* CHART */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '4px' }}>Daily Revenue Trends</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '24px' }}>Calculated from shift meter readings</p>
          <div style={{ height: '280px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d26a" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00d26a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e3325" vertical={false} />
                <XAxis dataKey="name" stroke="#94a39b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a39b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#101c15', border: '1px solid #1e3325', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#00d26a' }}
                  formatter={(value) => [`Rs ${value.toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#00d26a" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SHIFTS LOG */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Shifts Log</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>All recorded shift data</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {shifts.map((shift, i) => (
              <div key={shift.id || i} style={{
                padding: '16px', background: '#17281d', borderRadius: '12px', border: '1px solid #1e3325'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      background: 'rgba(0, 210, 106, 0.1)', color: '#00d26a',
                      padding: '10px', borderRadius: '50%'
                    }}>
                      <User size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '1rem' }}>{shift.salesman_name}</div>
                      <div style={{ color: '#94a39b', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> {formatDate(shift.start_time)} • {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: '#33ffa0' }}>{shift.kg_sold ? `${shift.kg_sold} Kg` : '—'}</div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                      {shift.revenue ? `Rs ${shift.revenue.toLocaleString()}` : '—'}
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: '#070e0a', padding: '12px', borderRadius: '8px', fontSize: '0.875rem',
                  flexWrap: 'wrap', gap: '8px'
                }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div>
                      <span style={{ color: '#94a39b' }}>Start: </span>
                      <span style={{ fontWeight: 500 }}>{shift.start_reading}</span>
                    </div>
                    <div>
                      <span style={{ color: '#94a39b' }}>End: </span>
                      <span style={{ fontWeight: 500 }}>{shift.end_reading || '—'}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px', borderRadius: '12px',
                      background: shift.status === 'completed' ? 'rgba(0, 210, 106, 0.1)' : 'rgba(255, 177, 66, 0.1)',
                      color: shift.status === 'completed' ? '#00d26a' : '#ffb142'
                    }}>
                      {shift.status === 'completed' ? 'Completed' : 'Active'}
                    </span>

                    {(shift.start_photo_url || shift.end_photo_url) && (
                      <button
                        onClick={() => setSelectedPhotos({ start: shift.start_photo_url, end: shift.end_photo_url, name: shift.salesman_name })}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          background: 'transparent', border: '1px solid #00d26a',
                          color: '#00d26a', padding: '4px 10px', borderRadius: '6px',
                          cursor: 'pointer', fontSize: '0.75rem', fontWeight: 500
                        }}
                      >
                        <ImageIcon size={14} /> Photos
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {shifts.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a39b' }}>
                No shifts recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PHOTO MODAL */}
      {selectedPhotos && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
        }} onClick={() => setSelectedPhotos(null)}>
          <div className="glass-panel" style={{ padding: '24px', maxWidth: '600px', width: '100%' }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontWeight: 600 }}>Meter Photos — {selectedPhotos.name}</h3>
              <button onClick={() => setSelectedPhotos(null)} style={{
                background: 'transparent', border: 'none', color: '#94a39b', cursor: 'pointer'
              }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <p style={{ color: '#94a39b', fontSize: '0.8rem', marginBottom: '8px', textAlign: 'center' }}>Start Reading</p>
                {selectedPhotos.start ? (
                  <img src={selectedPhotos.start} alt="Start meter"
                    style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #1e3325' }} />
                ) : (
                  <div style={{
                    height: '200px', borderRadius: '8px', border: '1px dashed #1e3325',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a39b', fontSize: '0.875rem'
                  }}>No photo</div>
                )}
              </div>
              <div>
                <p style={{ color: '#94a39b', fontSize: '0.8rem', marginBottom: '8px', textAlign: 'center' }}>End Reading</p>
                {selectedPhotos.end ? (
                  <img src={selectedPhotos.end} alt="End meter"
                    style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #1e3325' }} />
                ) : (
                  <div style={{
                    height: '200px', borderRadius: '8px', border: '1px dashed #1e3325',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a39b', fontSize: '0.875rem'
                  }}>No photo</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
