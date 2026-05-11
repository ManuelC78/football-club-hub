import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import useAuthStore from '../../store/auth.store';
import { getPlayers, createPlayer, deletePlayer } from '../../api/players';
import { uploadPlayerAvatar } from '../../api/upload';

const POSITIONS = ['Goalkeeper','Defender','Midfielder','Forward'];

export default function Squad() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const { clubId } = router.query;

  const [players, setPlayers]     = useState([]);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState({ firstName:'', lastName:'', dateOfBirth:'', position:'Midfielder', squadNumber:'', notes:'' });
  const [loading, setLoading]     = useState(false);
  const [uploadingId, setUploadingId] = useState(null);
  const fileRefs = useRef({});

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (clubId) loadPlayers();
  }, [isAuthenticated, clubId]);

  const loadPlayers = async () => {
    try {
      const res = await getPlayers({ clubId });
      setPlayers(res.data.players || []);
    } catch {}
  };

  const handleCreate = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await createPlayer({ ...form, clubId, squadNumber: form.squadNumber ? parseInt(form.squadNumber) : undefined });
      setForm({ firstName:'', lastName:'', dateOfBirth:'', position:'Midfielder', squadNumber:'', notes:'' });
      setShowForm(false);
      await loadPlayers();
    } catch (err) { alert(err.response?.data?.error || 'Failed to add player'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this player from the squad?')) return;
    await deletePlayer(id);
    await loadPlayers();
  };

  const handleAvatarUpload = async (playerId, file) => {
    setUploadingId(playerId);
    try {
      await uploadPlayerAvatar(playerId, file);
      await loadPlayers();
    } catch (err) { alert('Upload failed'); }
    finally { setUploadingId(null); }
  };

  const posColor = { Goalkeeper:'#e67e22', Defender:'#2980b9', Midfielder:'#27ae60', Forward:'#c0392b' };

  return (
    <div style={{ fontFamily:'sans-serif', minHeight:'100vh', background:'#f0f4fb' }}>
      <nav style={{ background:'#001f44', padding:'14px 32px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ color:'white', fontWeight:700 }}>⚽ Football Club Hub</span>
        <button onClick={() => router.push('/dashboard')}
          style={{ background:'rgba(255,255,255,0.15)', color:'white', border:'none', padding:'6px 14px', borderRadius:'6px', cursor:'pointer' }}>
          ← Dashboard
        </button>
      </nav>

      <div style={{ maxWidth:'1000px', margin:'0 auto', padding:'32px 20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
          <div>
            <h1 style={{ color:'#1a2a4a', marginBottom:'4px' }}>👤 Squad Manager</h1>
            <p style={{ color:'#666', fontSize:'0.9em' }}>{players.length} player{players.length!==1?'s':''}</p>
          </div>
          <button onClick={() => setShowForm(true)}
            style={{ background:'#003388', color:'white', border:'none', padding:'10px 22px', borderRadius:'8px', fontWeight:600, cursor:'pointer' }}>
            + Add Player
          </button>
        </div>

        {/* Position summary */}
        <div style={{ display:'flex', gap:'10px', flexWrap:'wrap', marginBottom:'20px' }}>
          {POSITIONS.map(pos => {
            const count = players.filter(p => p.position===pos).length;
            return (
              <div key={pos} style={{ background:'white', borderRadius:'8px', padding:'8px 16px',
                borderLeft:`4px solid ${posColor[pos]||'#888'}`, boxShadow:'0 1px 3px rgba(0,0,50,0.06)' }}>
                <div style={{ fontWeight:700, color:'#1a2a4a', fontSize:'1.1em' }}>{count}</div>
                <div style={{ color:'#888', fontSize:'0.78em' }}>{pos}s</div>
              </div>
            );
          })}
        </div>

        {/* Player grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:'14px' }}>
          {players.map(p => (
            <div key={p.id} style={{ background:'white', borderRadius:'12px', padding:'18px', textAlign:'center',
              boxShadow:'0 1px 4px rgba(0,0,50,0.07)', position:'relative' }}>
              <button onClick={() => handleDelete(p.id)}
                style={{ position:'absolute', top:'8px', right:'8px', background:'none', border:'none', color:'#ddd', cursor:'pointer', fontSize:'1em' }}>🗑</button>

              {/* Avatar */}
              <div style={{ position:'relative', display:'inline-block', marginBottom:'10px' }}>
                <div style={{ width:'60px', height:'60px', borderRadius:'50%', background: posColor[p.position]||'#eef3ff',
                  display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', margin:'0 auto' }}>
                  {p.avatar_url
                    ? <img src={p.avatar_url} alt={p.first_name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : <span style={{ color:'white', fontWeight:700, fontSize:'1.3em' }}>{p.first_name[0]}{p.last_name[0]}</span>}
                </div>
                <button
                  onClick={() => fileRefs.current[p.id]?.click()}
                  style={{ position:'absolute', bottom:0, right:-4, width:'20px', height:'20px', borderRadius:'50%',
                    background:'#003388', color:'white', border:'none', cursor:'pointer', fontSize:'0.7em', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {uploadingId===p.id ? '…' : '📷'}
                </button>
                <input ref={el => fileRefs.current[p.id]=el} type="file" accept="image/*"
                  onChange={e => e.target.files[0] && handleAvatarUpload(p.id, e.target.files[0])}
                  style={{ display:'none' }} />
              </div>

              <div style={{ fontWeight:700, color:'#1a2a4a', fontSize:'0.95em' }}>{p.first_name} {p.last_name}</div>
              {p.squad_number && <div style={{ color:'#888', fontSize:'0.8em' }}>#{p.squad_number}</div>}
              <div style={{ display:'inline-block', background: posColor[p.position]||'#eef3ff',
                color:'white', fontSize:'0.72em', fontWeight:600, padding:'2px 8px', borderRadius:'12px', marginTop:'6px' }}>
                {p.position || 'Unknown'}
              </div>
              {p.date_of_birth && (
                <div style={{ color:'#aaa', fontSize:'0.75em', marginTop:'4px' }}>
                  b. {new Date(p.date_of_birth).toLocaleDateString('en-GB')}
                </div>
              )}
            </div>
          ))}
        </div>

        {players.length === 0 && (
          <div style={{ background:'white', borderRadius:'12px', padding:'40px', textAlign:'center', color:'#888' }}>
            No players yet. Add your first squad member!
          </div>
        )}
      </div>

      {/* Add player modal */}
      {showForm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'white', width:'460px', borderRadius:'16px', padding:'28px', maxHeight:'90vh', overflow:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'18px' }}>
              <h2 style={{ color:'#1a2a4a' }}>Add Player</h2>
              <button onClick={() => setShowForm(false)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:'1.3em' }}>✕</button>
            </div>
            <form onSubmit={handleCreate} style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                <input placeholder="First name *" value={form.firstName}
                  onChange={e => setForm({...form, firstName:e.target.value})} required style={inp} />
                <input placeholder="Last name *" value={form.lastName}
                  onChange={e => setForm({...form, lastName:e.target.value})} required style={inp} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                <div>
                  <label style={lbl}>Date of Birth</label>
                  <input type="date" value={form.dateOfBirth}
                    onChange={e => setForm({...form, dateOfBirth:e.target.value})} style={inp} />
                </div>
                <div>
                  <label style={lbl}>Squad Number</label>
                  <input type="number" placeholder="#" value={form.squadNumber} min={1} max={99}
                    onChange={e => setForm({...form, squadNumber:e.target.value})} style={inp} />
                </div>
              </div>
              <select value={form.position} onChange={e => setForm({...form, position:e.target.value})} style={inp}>
                {POSITIONS.map(p => <option key={p}>{p}</option>)}
              </select>
              <textarea placeholder="Notes (optional)" value={form.notes}
                onChange={e => setForm({...form, notes:e.target.value})} rows={2} style={{...inp, resize:'vertical'}} />
              <button type="submit" disabled={loading}
                style={{ background:'#003388', color:'white', border:'none', padding:'11px', borderRadius:'8px', fontWeight:700, cursor:'pointer' }}>
                {loading ? 'Adding...' : 'Add to Squad'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const inp = { padding:'10px 12px', border:'1px solid #dde8f5', borderRadius:'8px', fontSize:'0.95em', width:'100%' };
const lbl = { fontSize:'0.8em', color:'#666', display:'block', marginBottom:'4px' };
