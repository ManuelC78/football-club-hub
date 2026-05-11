import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import useAuthStore from '../../store/auth.store';
import { getSessions, createSession, deleteSession, recordAttendance } from '../../api/sessions';
import { getPlayers } from '../../api/players';

const DRILL_TYPES = ['Warmup','Passing','Shooting','Defending','Possession','Set Pieces','Fitness','Cooldown'];

export default function TrainingPlanner() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const { clubId } = router.query;

  const [sessions, setSessions]       = useState([]);
  const [players,  setPlayers]        = useState([]);
  const [selected, setSelected]       = useState(null);
  const [showForm, setShowForm]       = useState(false);
  const [showAttend, setShowAttend]   = useState(false);
  const [loading, setLoading]         = useState(false);
  const [attendance, setAttendance]   = useState({});

  const emptyForm = { title:'', description:'', date:'', durationMins:90, location:'', objectives:'', drills:[] };
  const [form, setForm] = useState(emptyForm);
  const [drillInput, setDrillInput] = useState({ type:'Passing', name:'', durationMins:10, notes:'' });

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (clubId) {
      loadSessions();
      loadPlayers();
    }
  }, [isAuthenticated, clubId]);

  const loadSessions = async () => {
    try {
      const res = await getSessions({ clubId });
      setSessions(res.data.sessions || []);
    } catch {}
  };

  const loadPlayers = async () => {
    try {
      const res = await getPlayers({ clubId });
      setPlayers(res.data.players || []);
    } catch {}
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        clubId,
        objectives: form.objectives.split('\n').filter(Boolean),
      };
      await createSession(payload);
      setForm(emptyForm);
      setShowForm(false);
      await loadSessions();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create session');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this session?')) return;
    await deleteSession(id);
    await loadSessions();
    if (selected?.id === id) setSelected(null);
  };

  const handleSaveAttendance = async () => {
    const att = players.map(p => ({ playerId: p.id, present: !!attendance[p.id] }));
    await recordAttendance(selected.id, { attendance: att });
    alert('Attendance saved!');
    setShowAttend(false);
  };

  const addDrill = () => {
    if (!drillInput.name) return;
    setForm(f => ({ ...f, drills: [...f.drills, { ...drillInput }] }));
    setDrillInput({ type:'Passing', name:'', durationMins:10, notes:'' });
  };

  const removeDrill = (i) => setForm(f => ({ ...f, drills: f.drills.filter((_,idx) => idx!==i) }));

  if (!isAuthenticated) return null;

  return (
    <div style={{ fontFamily:'sans-serif', minHeight:'100vh', background:'#f0f4fb' }}>
      {/* Nav */}
      <nav style={{ background:'#001f44', padding:'14px 32px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ color:'white', fontWeight:700 }}>⚽ Football Club Hub</span>
        <button onClick={() => router.push('/dashboard')}
          style={{ background:'rgba(255,255,255,0.15)', color:'white', border:'none', padding:'6px 14px', borderRadius:'6px', cursor:'pointer' }}>
          ← Dashboard
        </button>
      </nav>

      <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'32px 20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
          <div>
            <h1 style={{ color:'#1a2a4a', marginBottom:'4px' }}>📋 Training Planner</h1>
            <p style={{ color:'#666', fontSize:'0.9em' }}>{sessions.length} session{sessions.length!==1?'s':''} planned</p>
          </div>
          <button onClick={() => setShowForm(true)}
            style={{ background:'#003388', color:'white', border:'none', padding:'10px 22px', borderRadius:'8px', fontWeight:600, cursor:'pointer' }}>
            + New Session
          </button>
        </div>

        <div style={{ display:'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap:'20px' }}>
          {/* Session list */}
          <div>
            {sessions.length === 0 && (
              <div style={{ background:'white', borderRadius:'12px', padding:'40px', textAlign:'center', color:'#888' }}>
                No sessions yet. Create your first one!
              </div>
            )}
            {sessions.map(s => (
              <div key={s.id}
                onClick={() => setSelected(s)}
                style={{ background:'white', borderRadius:'12px', padding:'18px 22px', marginBottom:'12px',
                  cursor:'pointer', border: selected?.id===s.id ? '2px solid #003388' : '2px solid transparent',
                  boxShadow:'0 1px 4px rgba(0,0,50,0.07)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div>
                    <div style={{ fontWeight:700, color:'#1a2a4a', fontSize:'1.05em' }}>{s.title}</div>
                    <div style={{ color:'#666', fontSize:'0.85em', marginTop:'4px' }}>
                      📅 {s.date ? new Date(s.date).toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short',year:'numeric'}) : '—'}
                      {' · '} ⏱ {s.duration_mins} min
                      {s.location ? ` · 📍 ${s.location}` : ''}
                    </div>
                    {s.objectives?.length > 0 && (
                      <div style={{ marginTop:'6px', display:'flex', gap:'6px', flexWrap:'wrap' }}>
                        {s.objectives.map((o,i) => (
                          <span key={i} style={{ background:'#eef3ff', color:'#003388', fontSize:'0.75em', padding:'2px 8px', borderRadius:'20px' }}>{o}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }}
                    style={{ background:'none', border:'none', color:'#c0392b', cursor:'pointer', fontSize:'1.1em', padding:'4px' }}>🗑</button>
                </div>
              </div>
            ))}
          </div>

          {/* Session detail panel */}
          {selected && (
            <div style={{ background:'white', borderRadius:'12px', padding:'24px', boxShadow:'0 1px 4px rgba(0,0,50,0.07)', position:'sticky', top:'20px', alignSelf:'start' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'16px' }}>
                <h2 style={{ color:'#1a2a4a', fontSize:'1.15em' }}>{selected.title}</h2>
                <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'#888', fontSize:'1.2em' }}>✕</button>
              </div>

              <div style={{ color:'#555', fontSize:'0.88em', marginBottom:'16px', lineHeight:'1.8' }}>
                <div>📅 {selected.date ? new Date(selected.date).toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'}) : '—'}</div>
                <div>⏱ {selected.duration_mins} minutes</div>
                {selected.location && <div>📍 {selected.location}</div>}
                {selected.description && <div style={{ marginTop:'8px' }}>{selected.description}</div>}
              </div>

              {/* Drills */}
              {selected.drills?.length > 0 && (
                <div style={{ marginBottom:'16px' }}>
                  <div style={{ fontWeight:700, color:'#1a2a4a', marginBottom:'8px' }}>🔧 Drills ({selected.drills.length})</div>
                  {selected.drills.map((d,i) => (
                    <div key={i} style={{ background:'#f8faff', borderRadius:'8px', padding:'10px 14px', marginBottom:'6px' }}>
                      <div style={{ fontWeight:600, color:'#1a2a4a', fontSize:'0.9em' }}>{d.name}</div>
                      <div style={{ color:'#888', fontSize:'0.8em' }}>{d.type} · {d.durationMins} min{d.notes ? ` · ${d.notes}` : ''}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Attendance */}
              <button onClick={() => { setAttendance({}); setShowAttend(true); }}
                style={{ width:'100%', background:'#27ae60', color:'white', border:'none', padding:'10px', borderRadius:'8px', fontWeight:600, cursor:'pointer' }}>
                ✅ Take Attendance ({players.length} players)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* New Session Modal */}
      {showForm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:100, overflow:'auto' }}>
          <div style={{ background:'white', maxWidth:'600px', margin:'40px auto', borderRadius:'16px', padding:'32px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'20px' }}>
              <h2 style={{ color:'#1a2a4a' }}>New Training Session</h2>
              <button onClick={() => setShowForm(false)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:'1.3em' }}>✕</button>
            </div>
            <form onSubmit={handleCreate} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              <input placeholder="Session title *" value={form.title}
                onChange={e => setForm({...form, title:e.target.value})} required style={inp} />
              <textarea placeholder="Description" value={form.description}
                onChange={e => setForm({...form, description:e.target.value})}
                rows={2} style={{...inp, resize:'vertical'}} />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                <div>
                  <label style={lbl}>Date & Time *</label>
                  <input type="datetime-local" value={form.date}
                    onChange={e => setForm({...form, date:e.target.value})} required style={inp} />
                </div>
                <div>
                  <label style={lbl}>Duration (mins)</label>
                  <input type="number" value={form.durationMins} min={15} max={240}
                    onChange={e => setForm({...form, durationMins:parseInt(e.target.value)})} style={inp} />
                </div>
              </div>
              <input placeholder="Location (e.g. Memorial Park, Pitch 1)" value={form.location}
                onChange={e => setForm({...form, location:e.target.value})} style={inp} />
              <textarea placeholder="Objectives (one per line)" value={form.objectives}
                onChange={e => setForm({...form, objectives:e.target.value})}
                rows={3} style={{...inp, resize:'vertical'}} />

              {/* Drills builder */}
              <div style={{ border:'1px solid #dde8f5', borderRadius:'10px', padding:'16px' }}>
                <div style={{ fontWeight:700, color:'#1a2a4a', marginBottom:'10px' }}>🔧 Drill Builder</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'8px' }}>
                  <select value={drillInput.type} onChange={e => setDrillInput({...drillInput, type:e.target.value})} style={inp}>
                    {DRILL_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                  <input placeholder="Drill name" value={drillInput.name}
                    onChange={e => setDrillInput({...drillInput, name:e.target.value})} style={inp} />
                  <input type="number" placeholder="Mins" value={drillInput.durationMins} min={5}
                    onChange={e => setDrillInput({...drillInput, durationMins:parseInt(e.target.value)})} style={inp} />
                  <input placeholder="Notes (optional)" value={drillInput.notes}
                    onChange={e => setDrillInput({...drillInput, notes:e.target.value})} style={inp} />
                </div>
                <button type="button" onClick={addDrill}
                  style={{ background:'#eef3ff', color:'#003388', border:'none', padding:'7px 16px', borderRadius:'6px', cursor:'pointer', fontWeight:600 }}>
                  + Add Drill
                </button>
                {form.drills.length > 0 && (
                  <div style={{ marginTop:'10px' }}>
                    {form.drills.map((d,i) => (
                      <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                        background:'#f8faff', borderRadius:'6px', padding:'6px 10px', marginBottom:'4px' }}>
                        <span style={{ fontSize:'0.85em', color:'#1a2a4a' }}>{d.name} ({d.type}, {d.durationMins}min)</span>
                        <button type="button" onClick={() => removeDrill(i)}
                          style={{ background:'none', border:'none', color:'#c0392b', cursor:'pointer' }}>✕</button>
                      </div>
                    ))}
                    <div style={{ fontSize:'0.8em', color:'#888', marginTop:'4px' }}>
                      Total drill time: {form.drills.reduce((a,d) => a+d.durationMins,0)} mins
                    </div>
                  </div>
                )}
              </div>

              <button type="submit" disabled={loading}
                style={{ background:'#003388', color:'white', border:'none', padding:'12px', borderRadius:'8px', fontWeight:700, fontSize:'1em', cursor:'pointer' }}>
                {loading ? 'Creating...' : '✅ Create Session'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {showAttend && selected && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:100, overflow:'auto' }}>
          <div style={{ background:'white', maxWidth:'480px', margin:'60px auto', borderRadius:'16px', padding:'28px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'16px' }}>
              <h2 style={{ color:'#1a2a4a', fontSize:'1.1em' }}>✅ Attendance — {selected.title}</h2>
              <button onClick={() => setShowAttend(false)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:'1.2em' }}>✕</button>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
              <button onClick={() => { const all={}; players.forEach(p => all[p.id]=true); setAttendance(all); }}
                style={{ background:'#27ae60', color:'white', border:'none', padding:'6px 14px', borderRadius:'6px', cursor:'pointer', fontSize:'0.85em' }}>
                All Present
              </button>
              <button onClick={() => setAttendance({})}
                style={{ background:'#e0e0e0', color:'#333', border:'none', padding:'6px 14px', borderRadius:'6px', cursor:'pointer', fontSize:'0.85em' }}>
                Clear All
              </button>
            </div>
            {players.length === 0 && <p style={{ color:'#888', textAlign:'center' }}>No players in squad yet.</p>}
            {players.map(p => (
              <div key={p.id}
                onClick={() => setAttendance(a => ({ ...a, [p.id]: !a[p.id] }))}
                style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px 14px',
                  borderRadius:'8px', marginBottom:'6px', cursor:'pointer',
                  background: attendance[p.id] ? '#eafaf1' : '#f8faff',
                  border: attendance[p.id] ? '1px solid #27ae60' : '1px solid #dde8f5' }}>
                <div style={{ width:'32px', height:'32px', borderRadius:'50%', background: attendance[p.id]?'#27ae60':'#ccc',
                  display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'0.85em', fontWeight:700 }}>
                  {attendance[p.id] ? '✓' : p.first_name[0]}
                </div>
                <span style={{ fontWeight:500, color:'#1a2a4a' }}>{p.first_name} {p.last_name}</span>
                <span style={{ marginLeft:'auto', fontSize:'0.8em', color: attendance[p.id]?'#27ae60':'#999' }}>
                  {attendance[p.id] ? '✅ Present' : 'Absent'}
                </span>
              </div>
            ))}
            <div style={{ marginTop:'16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ color:'#666', fontSize:'0.9em' }}>
                {Object.values(attendance).filter(Boolean).length} / {players.length} present
              </span>
              <button onClick={handleSaveAttendance}
                style={{ background:'#003388', color:'white', border:'none', padding:'10px 22px', borderRadius:'8px', fontWeight:600, cursor:'pointer' }}>
                Save Attendance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inp = { padding:'10px 12px', border:'1px solid #dde8f5', borderRadius:'8px', fontSize:'0.95em', width:'100%' };
const lbl = { fontSize:'0.8em', color:'#666', display:'block', marginBottom:'4px' };
