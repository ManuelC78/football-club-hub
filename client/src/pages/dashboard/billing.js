import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import useAuthStore from '../../store/auth.store';
import { getSubscription, createCheckout, createPortal } from '../../api/billing';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '£0',
    period: 'forever',
    color: '#6c757d',
    features: ['1 club', 'Up to 20 players', 'Basic fixtures', 'Email support'],
    cta: 'Current Plan',
  },
  {
    id: 'starter',
    name: 'Starter',
    price: '£9',
    period: '/month',
    color: '#003388',
    features: ['1 club', 'Unlimited players', 'Training planner', 'Attendance tracking', 'File uploads'],
    cta: 'Start 14-day trial',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '£19',
    period: '/month',
    color: '#27ae60',
    features: ['3 clubs', 'Unlimited players', 'Everything in Starter', 'Parent portal', 'Analytics dashboard', 'Priority support'],
    cta: 'Start 14-day trial',
    popular: true,
  },
  {
    id: 'elite',
    name: 'Elite',
    price: '£49',
    period: '/month',
    color: '#8e44ad',
    features: ['Unlimited clubs', 'Everything in Pro', 'Custom branding', 'API access', 'Dedicated onboarding', 'SLA support'],
    cta: 'Start 14-day trial',
  },
];

export default function Billing() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const { clubId, success, canceled } = router.query;

  const [sub, setSub]         = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]         = useState('');

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (success) setMsg('🎉 Subscription activated! Welcome to Football Club Hub.');
    if (canceled) setMsg('Checkout canceled — no charge made.');
    if (clubId) loadSub();
  }, [isAuthenticated, clubId, success, canceled]);

  const loadSub = async () => {
    try {
      const res = await getSubscription(clubId);
      setSub(res.data.subscription);
    } catch {}
  };

  const handleUpgrade = async (plan) => {
    if (plan === 'free') return;
    setLoading(true);
    try {
      const res = await createCheckout({
        clubId,
        plan,
        successUrl: `${window.location.origin}/dashboard/billing?clubId=${clubId}&success=1`,
        cancelUrl:  `${window.location.origin}/dashboard/billing?clubId=${clubId}&canceled=1`,
      });
      window.location.href = res.data.url;
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to start checkout');
      setLoading(false);
    }
  };

  const handlePortal = async () => {
    setLoading(true);
    try {
      const res = await createPortal({ clubId });
      window.location.href = res.data.url;
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to open billing portal');
      setLoading(false);
    }
  };

  const currentPlan = sub?.plan || 'free';

  return (
    <div style={{ fontFamily:'sans-serif', minHeight:'100vh', background:'#f0f4fb' }}>
      <nav style={{ background:'#001f44', padding:'14px 32px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ color:'white', fontWeight:700 }}>⚽ Football Club Hub</span>
        <button onClick={() => router.push('/dashboard')}
          style={{ background:'rgba(255,255,255,0.15)', color:'white', border:'none', padding:'6px 14px', borderRadius:'6px', cursor:'pointer' }}>
          ← Dashboard
        </button>
      </nav>

      <div style={{ maxWidth:'900px', margin:'0 auto', padding:'40px 20px' }}>
        <h1 style={{ color:'#1a2a4a', marginBottom:'8px' }}>💳 Billing & Plans</h1>
        <p style={{ color:'#666', marginBottom:'24px' }}>
          Current plan: <strong style={{ color:'#003388', textTransform:'capitalize' }}>{currentPlan}</strong>
          {sub?.current_period_end && ` · Renews ${new Date(sub.current_period_end).toLocaleDateString('en-GB')}`}
          {sub?.cancel_at_period_end && ' · Cancels at period end'}
        </p>

        {msg && (
          <div style={{ background: success ? '#eafaf1' : '#fff3cd', border:`1px solid ${success?'#27ae60':'#ffc107'}`,
            borderRadius:'10px', padding:'14px 18px', marginBottom:'24px', color: success?'#27ae60':'#856404' }}>
            {msg}
          </div>
        )}

        {/* Manage existing subscription */}
        {currentPlan !== 'free' && (
          <div style={{ background:'white', borderRadius:'12px', padding:'20px 24px', marginBottom:'28px',
            display:'flex', justifyContent:'space-between', alignItems:'center', boxShadow:'0 1px 4px rgba(0,0,50,0.07)' }}>
            <div>
              <div style={{ fontWeight:700, color:'#1a2a4a', marginBottom:'4px' }}>Manage subscription</div>
              <div style={{ color:'#888', fontSize:'0.88em' }}>Update payment method, download invoices, or cancel.</div>
            </div>
            <button onClick={handlePortal} disabled={loading}
              style={{ background:'#003388', color:'white', border:'none', padding:'10px 20px', borderRadius:'8px', fontWeight:600, cursor:'pointer' }}>
              Open Billing Portal →
            </button>
          </div>
        )}

        {/* Pricing cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'16px' }}>
          {PLANS.map(plan => {
            const isCurrent = plan.id === currentPlan;
            return (
              <div key={plan.id} style={{ background:'white', borderRadius:'14px', padding:'24px',
                border: plan.popular ? `2px solid ${plan.color}` : isCurrent ? `2px solid #27ae60` : '2px solid #eee',
                position:'relative', boxShadow:'0 1px 4px rgba(0,0,50,0.07)' }}>
                {plan.popular && (
                  <div style={{ position:'absolute', top:'-12px', left:'50%', transform:'translateX(-50%)',
                    background:plan.color, color:'white', fontSize:'0.75em', fontWeight:700,
                    padding:'3px 12px', borderRadius:'20px', whiteSpace:'nowrap' }}>
                    MOST POPULAR
                  </div>
                )}
                {isCurrent && (
                  <div style={{ position:'absolute', top:'-12px', right:'16px',
                    background:'#27ae60', color:'white', fontSize:'0.75em', fontWeight:700,
                    padding:'3px 12px', borderRadius:'20px' }}>
                    CURRENT
                  </div>
                )}
                <div style={{ fontWeight:800, color:plan.color, fontSize:'1.1em', marginBottom:'4px' }}>{plan.name}</div>
                <div style={{ fontSize:'2em', fontWeight:800, color:'#1a2a4a' }}>
                  {plan.price}<span style={{ fontSize:'0.45em', color:'#888', fontWeight:400 }}>{plan.period}</span>
                </div>
                <ul style={{ listStyle:'none', padding:0, margin:'16px 0', fontSize:'0.85em', color:'#555', lineHeight:'1.9' }}>
                  {plan.features.map(f => <li key={f}>✓ {f}</li>)}
                </ul>
                <button
                  disabled={isCurrent || loading}
                  onClick={() => handleUpgrade(plan.id)}
                  style={{ width:'100%', background: isCurrent?'#eee':plan.color, color: isCurrent?'#888':'white',
                    border:'none', padding:'10px', borderRadius:'8px', fontWeight:600,
                    cursor: isCurrent?'default':'pointer', fontSize:'0.9em' }}>
                  {isCurrent ? '✓ Active' : plan.cta}
                </button>
              </div>
            );
          })}
        </div>

        <p style={{ textAlign:'center', color:'#aaa', fontSize:'0.8em', marginTop:'24px' }}>
          All plans include a 14-day free trial. Cancel anytime. Prices ex. VAT.
        </p>
      </div>
    </div>
  );
}
