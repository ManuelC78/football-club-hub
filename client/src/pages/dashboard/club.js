import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import useAuthStore from '../../store/auth.store';
import { uploadClubLogo } from '../../api/upload';

export default function ClubSettings() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const { clubId } = router.query;
  const fileRef = useRef();

  const [logo, setLogo]       = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg]         = useState('');

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setLogo(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleUpload = async () => {
    if (!logo || !clubId) return;
    setUploading(true);
    try {
      const res = await uploadClubLogo(clubId, logo);
      setMsg(`✅ Logo updated! URL: ${res.data.url}`);
    } catch (err) {
      setMsg(`❌ ${err.response?.data?.error || 'Upload failed'}`);
    } finally { setUploading(false); }
  };

  return (
    <div style={{ fontFamily:'sans-serif', minHeight:'100vh', background:'#f0f4fb' }}>
      <nav style={{ background:'#001f44', padding:'14px 32px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ color:'white', fontWeight:700 }}>⚽ Football Club Hub</span>
        <button onClick={() => router.push('/dashboard')}
          style={{ background:'rgba(255,255,255,0.15)', color:'white', border:'none', padding:'6px 14px', borderRadius:'6px', cursor:'pointer' }}>
          ← Dashboard
        </button>
      </nav>

      <div style={{ maxWidth:'600px', margin:'0 auto', padding:'40px 20px' }}>
        <h1 style={{ color:'#1a2a4a', marginBottom:'24px' }}>🗂️ Club Settings</h1>

        {/* Logo upload */}
        <div style={{ background:'white', borderRadius:'12px', padding:'24px', marginBottom:'20px', boxShadow:'0 1px 4px rgba(0,0,50,0.07)' }}>
          <h3 style={{ color:'#1a2a4a', marginBottom:'16px' }}>Club Logo</h3>
          <div style={{ display:'flex', alignItems:'center', gap:'20px', marginBottom:'16px' }}>
            <div style={{ width:'80px', height:'80px', borderRadius:'12px', background:'#eef3ff',
              display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', border:'2px solid #dde8f5' }}>
              {preview
                ? <img src={preview} alt="logo" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                : <span style={{ fontSize:'2em' }}>⚽</span>}
            </div>
            <div>
              <button onClick={() => fileRef.current.click()}
                style={{ background:'#eef3ff', color:'#003388', border:'none', padding:'8px 16px',
                  borderRadius:'8px', cursor:'pointer', fontWeight:600, marginBottom:'6px', display:'block' }}>
                Choose Image
              </button>
              <div style={{ color:'#888', fontSize:'0.8em' }}>JPEG, PNG, WebP · Max 5MB</div>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display:'none' }} />
          {logo && (
            <button onClick={handleUpload} disabled={uploading}
              style={{ background:'#003388', color:'white', border:'none', padding:'10px 22px',
                borderRadius:'8px', fontWeight:600, cursor:'pointer' }}>
              {uploading ? 'Uploading...' : '⬆️ Upload Logo'}
            </button>
          )}
          {msg && <p style={{ marginTop:'10px', color: msg.startsWith('✅')?'#27ae60':'#c0392b', fontSize:'0.9em' }}>{msg}</p>}
        </div>

        {/* Billing shortcut */}
        <div style={{ background:'white', borderRadius:'12px', padding:'24px', boxShadow:'0 1px 4px rgba(0,0,50,0.07)' }}>
          <h3 style={{ color:'#1a2a4a', marginBottom:'8px' }}>💳 Subscription</h3>
          <p style={{ color:'#666', fontSize:'0.9em', marginBottom:'14px' }}>Manage your plan and billing details.</p>
          <button onClick={() => router.push(`/dashboard/billing?clubId=${clubId}`)}
            style={{ background:'#003388', color:'white', border:'none', padding:'10px 20px', borderRadius:'8px', fontWeight:600, cursor:'pointer' }}>
            Manage Billing →
          </button>
        </div>
      </div>
    </div>
  );
}
