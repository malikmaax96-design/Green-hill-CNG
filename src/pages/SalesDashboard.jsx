import React, { useState } from 'react';
import { Camera, User, Play, Square, CheckCircle2, AlertCircle, ArrowRight, Image as ImageIcon } from 'lucide-react';

const CNG_PRICE_PER_KG = 300; // Define current CNG price

const SalesDashboard = () => {
  // Simulate active shift in local storage or state
  const [activeShift, setActiveShift] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    salesmanName: '',
    meterReading: '',
    photoTaken: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhotoClick = () => {
    // Simulate opening camera and capturing
    setFormData(prev => ({ ...prev, photoTaken: true }));
  };

  const handleStartShift = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      setActiveShift({
        salesmanName: formData.salesmanName,
        startReading: parseFloat(formData.meterReading),
        startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        startDate: new Date().toLocaleDateString()
      });
      setFormData({ salesmanName: '', meterReading: '', photoTaken: false });
      setIsSubmitting(false);
    }, 800);
  };

  const handleEndShiftPreview = (e) => {
    e.preventDefault();
    const endReading = parseFloat(formData.meterReading);
    if (endReading <= activeShift.startReading) {
      alert("Ending meter reading must be greater than starting reading.");
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirmEndShift = () => {
    setIsSubmitting(true);
    
    setTimeout(() => {
      // Simulate saving to backend
      setActiveShift(null);
      setShowConfirmation(false);
      setFormData({ salesmanName: '', meterReading: '', photoTaken: false });
      setIsSubmitting(false);
      
      // Optional: show a temporary global success toast here
    }, 1200);
  };

  const calculatePreview = () => {
    const end = parseFloat(formData.meterReading) || 0;
    const start = activeShift?.startReading || 0;
    const kgSold = Math.max(0, end - start);
    const revenue = kgSold * CNG_PRICE_PER_KG;
    return { kgSold: kgSold.toFixed(2), revenue: revenue.toLocaleString() };
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '24px' }} className="animate-fade-in">
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px' }}>
          Green Hill <span style={{ color: 'var(--primary)' }}>CNG</span>
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          {activeShift ? 'Active Shift Management' : 'Shift Initialization'}
        </p>
      </header>

      {!activeShift ? (
        <form onSubmit={handleStartShift} className="glass-panel" style={{ padding: '32px' }}>
          <div style={{ marginBottom: '24px', textAlign: 'center' }}>
            <div style={{ 
              width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(0, 210, 106, 0.1)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' 
            }}>
              <Play size={28} color="var(--primary)" style={{ marginLeft: '4px' }} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Start New Shift</h2>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label className="input-label">Shift In-charge (Salesman)</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="input-field" 
                style={{ paddingLeft: '44px' }}
                placeholder="Enter your name"
                value={formData.salesmanName}
                onChange={(e) => setFormData({...formData, salesmanName: e.target.value})}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label className="input-label">Starting Meter Reading</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="number" 
                step="0.01"
                className="input-field" 
                placeholder="e.g. 10450.5"
                value={formData.meterReading}
                onChange={(e) => setFormData({...formData, meterReading: e.target.value})}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
             <button 
                type="button"
                onClick={handlePhotoClick}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: formData.photoTaken ? 'rgba(0, 210, 106, 0.1)' : 'var(--surface-hover)',
                  border: formData.photoTaken ? '1px solid var(--primary)' : '1px dashed var(--border)',
                  color: formData.photoTaken ? 'var(--primary)' : 'var(--text-main)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {formData.photoTaken ? <CheckCircle2 size={20} /> : <Camera size={20} />}
                <span style={{ fontWeight: 500 }}>
                  {formData.photoTaken ? 'Meter Photo Captured' : 'Take Photo of Meter'}
                </span>
              </button>
              {!formData.photoTaken && (
                <p style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '8px', textAlign: 'center' }}>
                  * Photo verification is mandatory
                </p>
              )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}
            disabled={isSubmitting || !formData.photoTaken}
          >
            {isSubmitting ? 'Starting Shift...' : 'Start Shift'}
          </button>
        </form>
      ) : showConfirmation ? (
        <div className="glass-panel animate-fade-in" style={{ padding: '32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
             <AlertCircle size={48} color="var(--warning)" style={{ margin: '0 auto 16px' }} />
             <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Confirm Shift End</h2>
             <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Please verify the calculations before saving.</p>
          </div>

          <div style={{ background: 'var(--surface-hover)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Salesman</span>
              <span style={{ fontWeight: 600 }}>{activeShift.salesmanName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Starting Meter</span>
              <span style={{ fontWeight: 600 }}>{activeShift.startReading}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Ending Meter</span>
              <span style={{ fontWeight: 600 }}>{formData.meterReading}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total Dispensed</span>
              <span style={{ fontWeight: 700, color: 'var(--primary-light)' }}>{calculatePreview().kgSold} Kg</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total Revenue</span>
              <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.2rem' }}>Rs {calculatePreview().revenue}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              type="button"
              className="btn btn-outline"
              style={{ flex: 1 }}
              onClick={() => setShowConfirmation(false)}
              disabled={isSubmitting}
            >
              Back to Edit
            </button>
            <button 
              type="button"
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={handleConfirmEndShift}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Confirm & Save'}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleEndShiftPreview} className="glass-panel animate-fade-in" style={{ padding: '32px' }}>
          <div style={{ 
            background: 'rgba(0, 210, 106, 0.05)', 
            border: '1px solid var(--primary-glow)', 
            borderRadius: '12px', 
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Active Shift</p>
              <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{activeShift.salesmanName}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Started At</p>
              <p style={{ fontWeight: 500 }}>{activeShift.startTime}</p>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
               <label className="input-label" style={{ marginBottom: 0 }}>Starting Reading</label>
               <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{activeShift.startReading}</span>
            </div>
            <label className="input-label" style={{ marginTop: '16px' }}>Ending Meter Reading</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="number" 
                step="0.01"
                className="input-field" 
                placeholder="Enter current meter reading"
                value={formData.meterReading}
                onChange={(e) => setFormData({...formData, meterReading: e.target.value})}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
             <button 
                type="button"
                onClick={handlePhotoClick}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: formData.photoTaken ? 'rgba(0, 210, 106, 0.1)' : 'var(--surface-hover)',
                  border: formData.photoTaken ? '1px solid var(--primary)' : '1px dashed var(--border)',
                  color: formData.photoTaken ? 'var(--primary)' : 'var(--text-main)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {formData.photoTaken ? <CheckCircle2 size={20} /> : <Camera size={20} />}
                <span style={{ fontWeight: 500 }}>
                  {formData.photoTaken ? 'End Meter Photo Captured' : 'Take Photo of End Meter'}
                </span>
              </button>
              {!formData.photoTaken && (
                <p style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '8px', textAlign: 'center' }}>
                  * End-of-shift photo verification is mandatory
                </p>
              )}
          </div>

          <button 
            type="submit" 
            className="btn" 
            style={{ width: '100%', padding: '16px', fontSize: '1.1rem', background: '#e74c3c', color: '#fff' }}
            disabled={!formData.photoTaken}
          >
            Review & End Shift <ArrowRight size={20} style={{ marginLeft: '8px' }} />
          </button>
        </form>
      )}
    </div>
  );
};

export default SalesDashboard;
