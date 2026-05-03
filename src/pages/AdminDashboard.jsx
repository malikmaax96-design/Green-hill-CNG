import React, { useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  TrendingUp, Droplets, DollarSign, Activity, Calendar, User, Image as ImageIcon, CheckCircle2, Clock
} from 'lucide-react';
import { format, subDays } from 'date-fns';

const data = Array.from({ length: 7 }).map((_, i) => ({
  name: format(subDays(new Date(), 6 - i), 'EEE'),
  revenue: Math.floor(Math.random() * 80000) + 30000,
  volume: Math.floor(Math.random() * 800) + 300
}));

const recentShifts = [
  { id: 'SH-892', salesman: 'Ahmad Khan', date: 'Today', startTime: '06:00 AM', endTime: '02:00 PM', startReading: 45012.5, endReading: 45212.5, volume: 200, revenue: 60000, status: 'Completed', photos: true },
  { id: 'SH-891', salesman: 'Raza Ali', date: 'Yesterday', startTime: '02:00 PM', endTime: '10:00 PM', startReading: 44812.5, endReading: 45012.5, volume: 200, revenue: 60000, status: 'Completed', photos: true },
  { id: 'SH-890', salesman: 'Tariq Mehmood', date: 'Yesterday', startTime: '06:00 AM', endTime: '02:00 PM', startReading: 44652.5, endReading: 44812.5, volume: 160, revenue: 48000, status: 'Completed', photos: true },
  { id: 'SH-889', salesman: 'Kamran', date: '2 Days Ago', startTime: '10:00 PM', endTime: '06:00 AM', startReading: 44410.0, endReading: 44652.5, volume: 242.5, revenue: 72750, status: 'Completed', photos: true },
];

const StatCard = ({ title, value, icon: Icon, trend, trendValue }) => (
  <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>{title}</span>
      <div style={{ background: 'rgba(0, 210, 106, 0.1)', padding: '8px', borderRadius: '10px' }}>
        <Icon size={20} color="var(--primary)" />
      </div>
    </div>
    <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{value}</div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem' }}>
      <TrendingUp size={16} color={trend === 'up' ? 'var(--primary)' : 'var(--danger)'} />
      <span style={{ color: trend === 'up' ? 'var(--primary)' : 'var(--danger)' }}>{trendValue}</span>
      <span style={{ color: 'var(--text-muted)' }}>vs last week</span>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }} className="animate-fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Shift Overview</h1>
          <p style={{ color: 'var(--text-muted)' }}>Green Hill CNG Management</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
            <Calendar size={16} /> Today
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <StatCard title="Total Daily Revenue" value="Rs 120,000" icon={DollarSign} trend="up" trendValue="+5.5%" />
        <StatCard title="Total KG Dispensed" value="400 Kg" icon={Droplets} trend="up" trendValue="+2.1%" />
        <StatCard title="Active Shifts" value="1 Unit" icon={Activity} trend="up" trendValue="100%" />
        <StatCard title="Completed Shifts" value="3" icon={CheckCircle2} trend="up" trendValue="+0.0%" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {/* Main Chart */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Daily Revenue Trends</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Calculated from shift meter readings</p>
          </div>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rs${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--primary)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Shifts */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Recent Shifts Log</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Verified end-of-shift reports</p>
            </div>
            <button style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>
              View All
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflowY: 'auto' }}>
            {recentShifts.map((shift, i) => (
              <div key={i} style={{ 
                padding: '16px',
                background: 'var(--surface-hover)',
                borderRadius: '12px',
                border: '1px solid var(--border)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      background: 'rgba(0, 210, 106, 0.1)',
                      color: 'var(--primary)',
                      padding: '10px',
                      borderRadius: '50%'
                    }}>
                      <User size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '1rem' }}>{shift.salesman}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> {shift.date} • {shift.startTime} - {shift.endTime}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: 'var(--primary-light)' }}>{shift.volume} Kg</div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>Rs {shift.revenue.toLocaleString()}</div>
                  </div>
                </div>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  background: 'var(--bg-dark)',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Start: </span>
                      <span style={{ fontWeight: 500 }}>{shift.startReading}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>End: </span>
                      <span style={{ fontWeight: 500 }}>{shift.endReading}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedImage(shift.id)}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px', 
                      background: 'transparent',
                      border: '1px solid var(--primary)',
                      color: 'var(--primary)',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 500
                    }}
                  >
                    <ImageIcon size={14} /> View Photos
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Image Modal Placeholder */}
      {selectedImage && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column'
        }}>
          <div className="glass-panel" style={{ padding: '24px', maxWidth: '500px', width: '90%', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '16px' }}>Meter Reading Verification</h3>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <div style={{ flex: 1, background: 'var(--surface-hover)', height: '200px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Start Reading Photo</span>
              </div>
              <div style={{ flex: 1, background: 'var(--surface-hover)', height: '200px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border)' }}>
                <span style={{ color: 'var(--text-muted)' }}>End Reading Photo</span>
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => setSelectedImage(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
