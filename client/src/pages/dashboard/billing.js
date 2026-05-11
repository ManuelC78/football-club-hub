import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import useAuthStore from '../../store/auth.store';
import { getSubscription, createCheckout, createPortal } from '../../api/billing';

/**
 * Pricing tiers — revised May 2026
 * Aligned with live footballclubhub.app pricing + GTM strategy
 *
 * Key changes from previous version:
 * - Removed old £9/£19/£49 tiers (too low for club-level market)
 * - Added Club Starter (£19/mo) as a mid-tier for small grassroots clubs
 * - Club Pro (£49/mo) replaces the old "Club" at £89 for growing clubs
 * - Academy (£89/mo) replaces "Contact Us" with a real price anchor
 * - Free plan updated to match live app (1 team, 2 AI sessions/week)
 */
const PLANS = [
  {
    id: 'coach',
    name: 'Coach',
    price: '£0',
    period: 'forever',
    color: '#6c757d',
    badge: null,
    description: 'Perfect for individual coaches getting started.',
    features: [
      '1 Team',
      'Up to 3 coaches included',
      'Player Management',
      'Training Planner',
      'Exercise Library',
      'Analytics',
      '2 AI Session Generations/week',
      'Tactics Board',
      'Match Analysis & Reviews',
    ],
    addons: [
      'Extra coaches: £3.99/mo per coach',
      'Extra AI Session: £1.99/each',
    ],
    cta: 'Get Started Free',
    stripe_price_id: null,
  },
  {
    id: 'club_starter',
    name: 'Club Starter',
    price: '£19',
    period: '/month',
    color: '#2980b9',
    badge: null,
    description: 'For small grassroots clubs managing up to 5 teams.',
    features: [
      'Everything in Coach',
      'Up to 5 Teams',
      'Unlimited Players',
      '20 AI Session Generations/month',
      'Staff Management',
      'Team Messaging',
      'Player Performance Reports (PDF)',
    ],
    addons: [
      'Extra team: £5.99/mo',
    ],
    cta: 'Start 30-day Free Trial',
    stripe_price_id: process.env.NEXT_PUBLIC_STRIPE_CLUB_STARTER_PRICE_ID,
    trial_days: 30,
  },
  {
    id: 'club_pro',
    name: 'Club Pro',
    price: '£49',
    period: '/month',
    color: '#27ae60',
    badge: 'Most Popular',
    description: 'Everything a growing club needs in one platform.',
    features: [
      'Everything in Club Starter',
      'Up to 20 Teams',
      'Unlimited AI Session Generation',
      'Match Center — Lineups, Formations & Captains',
      'Player Performance Reports (PDF & Email)',
      'Advanced Analytics Dashboard',
      'Priority Support',
    ],
    addons: [
      'Extra team: £5.99/mo',
    ],
    cta: 'Start 30-day Free Trial',
    stripe_price_id: process.env.NEXT_PUBLIC_STRIPE_CLUB_PRO_PRICE_ID,
    trial_days: 30,
  },
  {
    id: 'academy',
    name: 'Academy',
    price: '£89',
    period: '/month',
    color: '#8e44ad',
    badge: null,
    description: 'For professional academies and large organisations.',
    features: [
      'Everything in Club Pro',
      'Unlimited Teams',
      'Multi-Staff Access & Roles',
      'Custom Branding',
      'Scouting Platform',
      'Match Analysis Platform',
      'Dedicated Onboarding',
      'SLA Guarantee',
      'Custom Integrations',
    ],
    addons: [],
    cta: 'Start 30-day Free Trial',
    stripe_price_id: process.env.NEXT_PUBLIC_STRIPE_ACADEMY_PRICE_ID,
    trial_days: 30,
    contact_cta: true, // show "Contact Us" as secondary option for enterprise
  },
];

export { PLANS };

export default function Billing() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const { clubId, success, canceled } = router.query;

  const [sub, setSub]         = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]         = useState('');
  const [billing, setBilling] = useState('monthly'); // 'monthly' | 'annual'

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
    if (plan === 'coach') return;
    setLoading(true);
    try {
      const res = await createCheckout({
        clubId,
        plan,
        billingCycle: billing,
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

  const getDisplayPrice = (plan) => {
    if (plan.id === 'coach') return plan.price;
    const monthly = parseInt(plan.price.replace('£',''));
    if (billing === 'annual') {
      const annual = Math.round(monthly * 10); // 2 months free
      return `£${annual}`;
    }
    return plan.price;
  };

  const currentPlan = sub?.plan || 'coach';

  return (
    <div style={{ fontFamily:'sans-serif', minHeight:'100vh', background:'#f0f4fb' }}>
      <nav style={{ background:'#001f44', padding:'14px 32px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ color:'white', fontWeight:700 }}>⚽ Football Club Hub</span>
        <button onClick={() => router.push('/dashboard')}
          style={{ background:'rgba(255,255,255,0.15)', color:'white', border:'none', padding:'6px 14px', borderRadius:'6px', cursor:'pointer' }}>
          ← Dashboard
        </button>
      </nav>

      <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'40px 20px' }}>
        <h1 style={{ color:'#1a2a4a', marginBottom:'8px', textAlign:'center' }}>Simple, transparent pricing</h1>
        <p style={{ color:'#666', marginBottom:'12px', textAlign:'center' }}>
          Start free and upgrade as your club grows. No hidden fees, cancel anytime.
        </p>

        {/* Billing toggle */}
        <div style={{ display:'flex', justifyContent:'center', gap:'0', marginBottom:'32px', background:'#e8edf5', borderRadius:'8px', width:'fit-content', margin:'0 auto 32px' }}>
          {['monthly','annual'].map(b => (
            <button key={b} onClick={() => setBilling(b)}
              style={{ padding:'8px 22px', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:600, fontSize:'0.9em',
                background: billing === b ? '#003388' : 'transparent',
                color: billing === b ? 'white' : '#555' }}>
              {b === 'monthly' ? 'Monthly' : 'Annual (2 months free)'}
            </button>
          ))}
        </div>

        {msg && (
          <div style={{ background: success ? '#eafaf1' : '#fff3cd', border:`1px solid ${success?'#27ae60':'#ffc107'}`,
            borderRadius:'10px', padding:'14px 18px', marginBottom:'24px', color: success?'#27ae60':'#856404' }}>
            {msg}
          </div>
        )}

        {currentPlan !== 'coach' && (
          <div style={{ background:'white', borderRadius:'12px', padding:'20px 24px', marginBottom:'28px',
            display:'flex', justifyContent:'space-between', alignItems:'center', boxShadow:'0 1px 4px rgba(0,0,50,0.07)' }}>
            <div>
              <div style={{ fontWeight:700, color:'#1a2a4a', marginBottom:'4px' }}>Manage subscription</div>
              <div style={{ color:'#888', fontSize:'0.88em' }}>Update payment method, download invoices, or cancel.</div>
            </div>
            <button onClick={handlePortal} disabled={loading}
              style={{ background:'#003388', color:'white', border:'none', padding:'10px 22px', borderRadius:'8px', cursor:'pointer', fontWeight:600 }}>
              Billing Portal →
            </button>
          </div>
        )}

        {/* Plan cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:'18px' }}>
          {PLANS.map(plan => {
            const isCurrent = currentPlan === plan.id;
            return (
              <div key={plan.id} style={{
                background:'white', borderRadius:'14px', padding:'26px 22px',
                border: plan.badge ? '2px solid #27ae60' : isCurrent ? '2px solid #003388' : '2px solid #eee',
                boxShadow: plan.badge ? '0 4px 20px rgba(39,174,96,0.15)' : '0 2px 8px rgba(0,0,50,0.07)',
                position:'relative',
              }}>
                {plan.badge && (
                  <div style={{ position:'absolute', top:'-12px', left:'50%', transform:'translateX(-50%)',
                    background:'#27ae60', color:'white', padding:'4px 14px', borderRadius:'12px', fontSize:'0.75em', fontWeight:700 }}>
                    ⭐ {plan.badge}
                  </div>
                )}
                {isCurrent && !plan.badge && (
                  <div style={{ position:'absolute', top:'-12px', left:'50%', transform:'translateX(-50%)',
                    background:'#003388', color:'white', padding:'4px 14px', borderRadius:'12px', fontSize:'0.75em', fontWeight:700 }}>
                    Current Plan
                  </div>
                )}

                <div style={{ fontWeight:800, fontSize:'1.1em', color: plan.color, marginBottom:'4px' }}>{plan.name}</div>
                <div style={{ fontSize:'0.82em', color:'#888', marginBottom:'14px' }}>{plan.description}</div>

                <div style={{ marginBottom:'16px' }}>
                  <span style={{ fontSize:'2.2em', fontWeight:800, color:'#1a2a4a' }}>{getDisplayPrice(plan)}</span>
                  <span style={{ fontSize:'0.82em', color:'#888' }}>{billing === 'annual' && plan.id !== 'coach' ? '/year' : plan.period}</span>
                  {billing === 'annual' && plan.id !== 'coach' && (
                    <div style={{ fontSize:'0.75em', color:'#27ae60', fontWeight:600, marginTop:'2px' }}>2 months free 🎉</div>
                  )}
                </div>

                <ul style={{ listStyle:'none', padding:0, margin:'0 0 18px', fontSize:'0.83em', color:'#444' }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ padding:'4px 0', display:'flex', gap:'8px', alignItems:'flex-start' }}>
                      <span style={{ color:'#27ae60', fontWeight:700, flexShrink:0 }}>✓</span>{f}
                    </li>
                  ))}
                </ul>

                {plan.addons.length > 0 && (
                  <div style={{ borderTop:'1px solid #f0f4fb', paddingTop:'12px', marginBottom:'16px' }}>
                    <div style={{ fontSize:'0.72em', fontWeight:700, color:'#aaa', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'6px' }}>Add-ons</div>
                    {plan.addons.map(a => (
                      <div key={a} style={{ fontSize:'0.78em', color:'#666', padding:'2px 0' }}>+ {a}</div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => isCurrent ? null : handleUpgrade(plan.id)}
                  disabled={loading || isCurrent}
                  style={{
                    width:'100%', padding:'11px', borderRadius:'8px', border:'none', cursor: isCurrent ? 'default' : 'pointer',
                    fontWeight:700, fontSize:'0.9em',
                    background: isCurrent ? '#f0f4fb' : plan.badge ? '#27ae60' : plan.id === 'coach' ? '#f0f4fb' : '#003388',
                    color: isCurrent ? '#aaa' : plan.id === 'coach' ? '#555' : 'white',
                  }}>
                  {isCurrent ? '✓ Current Plan' : loading ? 'Loading...' : plan.cta}
                </button>

                {plan.contact_cta && !isCurrent && (
                  <a href="mailto:hello@footballclubhub.app?subject=Academy Plan Enquiry"
                    style={{ display:'block', textAlign:'center', marginTop:'8px', fontSize:'0.8em', color:'#8e44ad' }}>
                    Need more? Contact us →
                  </a>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ textAlign:'center', marginTop:'28px', color:'#aaa', fontSize:'0.82em' }}>
          🔒 Secure payments via Stripe · 30-day free trial on all paid plans · Cancel anytime
        </div>
      </div>
    </div>
  );
}
