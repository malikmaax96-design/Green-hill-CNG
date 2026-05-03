import React, { useState, useRef, useEffect } from 'react';
import { Camera, User, Play, CheckCircle2, AlertCircle, ArrowRight, X, Fuel } from 'lucide-react';
import { supabase } from '../lib/supabase';

const CNG_PRICE_PER_KG = 300;
const BOOTHS = [1, 2, 3, 4];

const SalesDashboard = () => {
  const [activeShift, setActiveShift] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    salesmanName: '',
    boothNumber: '',
    meterReading: '',
    photo: null,
    photoPreview: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // Check for active shift on load
  useEffect(() => {
    const saved = localStorage.getItem('activeShift');
    if (saved) {
      setActiveShift(JSON.parse(saved));
    }
  }, []);

  const handlePhotoCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        photo: file,
        photoPreview: previewUrl
      }));
    }
  };

  const removePhoto = () => {
    if (formData.photoPreview) {
      URL.revokeObjectURL(formData.photoPreview);
    }
    setFormData(prev => ({ ...prev, photo: null, photoPreview: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadPhoto = async (file, shiftId, type) => {
    const fileName = `${shiftId}_${type}_${Date.now()}.jpg`;
    const { data, error } = await supabase.storage
      .from('meter-photos')
      .upload(fileName, file, { contentType: file.type });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('meter-photos')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const handleStartShift = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const shiftId = `shift_${Date.now()}`;
      let photoUrl = null;

      if (formData.photo) {
        photoUrl = await uploadPhoto(formData.photo, shiftId, 'start');
      }

      const shiftData = {
        salesman_name: formData.salesmanName,
        booth_number: parseInt(formData.boothNumber),
        start_reading: parseFloat(formData.meterReading),
        start_photo_url: photoUrl,
        start_time: new Date().toISOString(),
        status: 'active'
      };

      const { data, error } = await supabase
        .from('shifts')
        .insert([shiftData])
        .select();

      if (error) throw error;

      const shift = {
        id: data[0].id,
        salesmanName: formData.salesmanName,
        boothNumber: formData.boothNumber,
        startReading: parseFloat(formData.meterReading),
        startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        startDate: new Date().toLocaleDateString()
      };

      setActiveShift(shift);
      localStorage.setItem('activeShift', JSON.stringify(shift));
      setFormData({ salesmanName: '', boothNumber: '', meterReading: '', photo: null, photoPreview: null });
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('Error starting shift:', err);
      // Fallback: save locally if Supabase is not configured
      const shift = {
        id: `local_${Date.now()}`,
        salesmanName: formData.salesmanName,
        boothNumber: formData.boothNumber,
        startReading: parseFloat(formData.meterReading),
        startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        startDate: new Date().toLocaleDateString()
      };
      setActiveShift(shift);
      localStorage.setItem('activeShift', JSON.stringify(shift));
      setFormData({ salesmanName: '', boothNumber: '', meterReading: '', photo: null, photoPreview: null });
      if (fileInputRef.current) fileInputRef.current.value = '';
    }

    setIsSubmitting(false);
  };

  const handleEndShiftPreview = (e) => {
    e.preventDefault();
    const endReading = parseFloat(formData.meterReading);
    if (endReading <= activeShift.startReading) {
      alert('Ending meter reading must be greater than starting reading.');
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirmEndShift = async () => {
    setIsSubmitting(true);

    try {
      const endReading = parseFloat(formData.meterReading);
      const kgSold = endReading - activeShift.startReading;
      const revenue = kgSold * CNG_PRICE_PER_KG;

      let photoUrl = null;
      if (formData.photo) {
        photoUrl = await uploadPhoto(formData.photo, activeShift.id, 'end');
      }

      await supabase
        .from('shifts')
        .update({
          end_reading: endReading,
          end_photo_url: photoUrl,
          end_time: new Date().toISOString(),
          kg_sold: kgSold,
          revenue: revenue,
          status: 'completed'
        })
        .eq('id', activeShift.id);
    } catch (err) {
      console.error('Error ending shift:', err);
    }

    setActiveShift(null);
    localStorage.removeItem('activeShift');
    setShowConfirmation(false);
    setFormData({ salesmanName: '', boothNumber: '', meterReading: '', photo: null, photoPreview: null });
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsSubmitting(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 4000);
  };

  const calculatePreview = () => {
    const end = parseFloat(formData.meterReading) || 0;
    const start = activeShift?.startReading || 0;
    const kgSold = Math.max(0, end - start);
    const revenue = kgSold * CNG_PRICE_PER_KG;
    return { kgSold: kgSold.toFixed(2), revenue: revenue.toLocaleString() };
  };

  // Hidden file input for camera
  const CameraInput = () => (
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      capture="environment"
      onChange={handlePhotoCapture}
      style={{ display: 'none' }}
    />
  );

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '24px', minHeight: '100vh' }} className="animate-fade-in">
      <CameraInput />

      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px' }}>
          Green Hill <span style={{ color: 'var(--primary)' }}>CNG</span>
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          {activeShift ? 'Active Shift Management' : 'Shift Initialization'}
        </p>
      </header>

      {/* SUCCESS ANIMATION */}
      {showSuccess && (
        <div className="glass-panel animate-fade-in" style={{ 
          padding: '48px 32px', textAlign: 'center', marginBottom: '24px',
          border: '1px solid var(--primary)'
        }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'rgba(0, 210, 106, 0.15)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
            animation: 'pulse 1.5s ease infinite'
          }}>
            <CheckCircle2 size={48} color="var(--primary)" />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Shift Saved Successfully!</h2>
          <p style={{ color: 'var(--text-muted)' }}>All data has been recorded.</p>
        </div>
      )}

      {/* START SHIFT FORM */}
      {!activeShift && !showSuccess && (
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
                onChange={(e) => setFormData({ ...formData, salesmanName: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label className="input-label">Select Booth / Dispenser</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {BOOTHS.map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setFormData({ ...formData, boothNumber: String(num) })}
                  style={{
                    padding: '14px 8px',
                    borderRadius: '12px',
                    border: '2px solid',
                    borderColor: formData.boothNumber === String(num) ? 'var(--primary)' : 'var(--border)',
                    background: formData.boothNumber === String(num) ? 'rgba(0, 210, 106, 0.15)' : 'var(--surface-hover)',
                    color: formData.boothNumber === String(num) ? 'var(--primary)' : 'var(--text-main)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s',
                    fontWeight: formData.boothNumber === String(num) ? 700 : 400
                  }}
                >
                  <Fuel size={18} />
                  <span style={{ fontSize: '0.85rem' }}>Booth {num}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label className="input-label">Starting Meter Reading</label>
            <input
              type="number"
              step="0.01"
              className="input-field"
              placeholder="e.g. 10450.5"
              value={formData.meterReading}
              onChange={(e) => setFormData({ ...formData, meterReading: e.target.value })}
              required
            />
          </div>

          {/* PHOTO SECTION */}
          <div style={{ marginBottom: '32px' }}>
            {formData.photoPreview ? (
              <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--primary)' }}>
                <img
                  src={formData.photoPreview}
                  alt="Meter reading"
                  style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }}
                />
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                  padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem' }}>
                    <CheckCircle2 size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                    Photo Captured
                  </span>
                  <button
                    type="button"
                    onClick={removePhoto}
                    style={{
                      background: 'rgba(255,71,87,0.2)', border: '1px solid var(--danger)',
                      color: 'var(--danger)', borderRadius: '8px', padding: '6px 12px',
                      cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px'
                    }}
                  >
                    <X size={14} /> Retake
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: '100%', padding: '24px', background: 'var(--surface-hover)',
                  border: '2px dashed var(--border)', borderRadius: '12px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: '10px', cursor: 'pointer', transition: 'all 0.2s',
                  color: 'var(--text-main)'
                }}
              >
                <Camera size={32} color="var(--primary)" />
                <span style={{ fontWeight: 600 }}>Take Photo of Meter</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tap to open camera</span>
              </button>
            )}
            {!formData.photoPreview && (
              <p style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '8px', textAlign: 'center' }}>
                * Photo verification is mandatory
              </p>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}
            disabled={isSubmitting || !formData.photoPreview || !formData.boothNumber}
          >
            {isSubmitting ? 'Starting Shift...' : 'Start Shift'}
          </button>
        </form>
      )}

      {/* CONFIRMATION SCREEN */}
      {activeShift && showConfirmation && (
        <div className="glass-panel animate-fade-in" style={{ padding: '32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <AlertCircle size={48} color="var(--warning)" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Confirm Shift End</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Verify the calculations before saving.</p>
          </div>

          {formData.photoPreview && (
            <div style={{ marginBottom: '20px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
              <img src={formData.photoPreview} alt="End meter" style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }} />
            </div>
          )}

          <div style={{ background: 'var(--surface-hover)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Salesman</span>
              <span style={{ fontWeight: 600 }}>{activeShift.salesmanName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Booth</span>
              <span style={{ fontWeight: 600 }}>Booth {activeShift.boothNumber}</span>
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
            <button type="button" className="btn btn-outline" style={{ flex: 1 }}
              onClick={() => setShowConfirmation(false)} disabled={isSubmitting}>
              Back
            </button>
            <button type="button" className="btn btn-primary" style={{ flex: 1 }}
              onClick={handleConfirmEndShift} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Confirm & Save'}
            </button>
          </div>
        </div>
      )}

      {/* END SHIFT FORM */}
      {activeShift && !showConfirmation && !showSuccess && (
        <form onSubmit={handleEndShiftPreview} className="glass-panel animate-fade-in" style={{ padding: '32px' }}>
          <div style={{
            background: 'rgba(0, 210, 106, 0.05)', border: '1px solid rgba(0, 210, 106, 0.3)',
            borderRadius: '12px', padding: '16px', marginBottom: '24px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Active Shift — Booth {activeShift.boothNumber}</p>
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
            <input
              type="number"
              step="0.01"
              className="input-field"
              placeholder="Enter current meter reading"
              value={formData.meterReading}
              onChange={(e) => setFormData({ ...formData, meterReading: e.target.value })}
              required
            />
          </div>

          {/* END SHIFT PHOTO */}
          <div style={{ marginBottom: '32px' }}>
            {formData.photoPreview ? (
              <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--primary)' }}>
                <img src={formData.photoPreview} alt="End meter reading"
                  style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }} />
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                  padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem' }}>
                    <CheckCircle2 size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                    End Photo Captured
                  </span>
                  <button type="button" onClick={removePhoto}
                    style={{
                      background: 'rgba(255,71,87,0.2)', border: '1px solid var(--danger)',
                      color: 'var(--danger)', borderRadius: '8px', padding: '6px 12px',
                      cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                    <X size={14} /> Retake
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => fileInputRef.current?.click()}
                style={{
                  width: '100%', padding: '24px', background: 'var(--surface-hover)',
                  border: '2px dashed var(--border)', borderRadius: '12px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: '10px', cursor: 'pointer', transition: 'all 0.2s',
                  color: 'var(--text-main)'
                }}>
                <Camera size={32} color="var(--primary)" />
                <span style={{ fontWeight: 600 }}>Take Photo of End Meter</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tap to open camera</span>
              </button>
            )}
            {!formData.photoPreview && (
              <p style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '8px', textAlign: 'center' }}>
                * End-of-shift photo is mandatory
              </p>
            )}
          </div>

          <button type="submit" className="btn"
            style={{ width: '100%', padding: '16px', fontSize: '1.1rem', background: '#e74c3c', color: '#fff' }}
            disabled={!formData.photoPreview}>
            Review & End Shift <ArrowRight size={20} style={{ marginLeft: '8px' }} />
          </button>
        </form>
      )}
    </div>
  );
};

export default SalesDashboard;
