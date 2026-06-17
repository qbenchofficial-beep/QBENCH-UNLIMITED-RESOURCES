import { useState, FormEvent } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Globe, 
  ArrowRight, 
  MessageSquare, 
  Headphones, 
  Send,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  MessageCircle
} from 'lucide-react';
import { NavSection, ServiceTab } from '../types';
import { sendEmailJS } from '../lib/emailService';

interface ContactViewProps {
  onNavigate?: (section: NavSection, tab?: ServiceTab) => void;
}

export default function ContactView({ onNavigate }: ContactViewProps) {
  // Form State using the exact keys requested for EmailJS
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    service: 'Branding', // Default service option
    message: ''
  });
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [formError, setFormError] = useState<string | null>(null);

  // SMTP diagnostics states
  const [smtpChecking, setSmtpChecking] = useState(false);
  const [smtpResult, setSmtpResult] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
    error?: string;
    code?: string;
    advice?: string;
    details?: {
      host: string;
      port: number;
      user: string;
      ssl: boolean;
    };
  } | null>(null);

  const testSmtpConnection = async () => {
    setSmtpChecking(true);
    setSmtpResult(null);
    try {
      console.log('[Diagnostics] Triggering active server-side/Gmail-SMTP handshake test via /api/smtp-test...');
      const response = await fetch('/api/smtp-test');
      const data = await response.json();
      setSmtpResult({
        tested: true,
        success: data.success,
        message: data.message,
        error: data.error,
        code: data.code,
        advice: data.advice,
        details: data.details
      });
    } catch (err: any) {
      console.error('SMTP test execution network or server error:', err);
      setSmtpResult({
        tested: true,
        success: false,
        message: 'Could not contact the server SMTP diagnostics API route. Please ensure the dev server is active and port 3000 is open.',
        error: err?.message || 'Network Exception'
      });
    } finally {
      setSmtpChecking(false);
    }
  };

  // Anti-spam honeypot protection field
  const [honeypot, setHoneypot] = useState('');

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Spam protection check (Honeypot)
    if (honeypot.trim() !== '') {
      console.warn('Spam detected via Honeypot check.');
      setFormState('success'); // Pretend success to confuse bots
      return;
    }

    // Comprehensive client-side form validation
    if (!formData.name.trim()) {
      alert("Please enter your name.");
      return;
    }
    if (!formData.phone.trim()) {
      alert("Please enter your phone number.");
      return;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailPattern.test(formData.email)) {
      alert("Please enter a valid email address.");
      return;
    }
    if (!formData.message.trim()) {
      alert("Please enter your message.");
      return;
    }

    setFormState('submitting');
    setFormError(null);

    try {
      // Trigger modern client-side EmailJS integration
      const outcome = await sendEmailJS({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        company: formData.company,
        service: formData.service,
        message: formData.message
      });

      if (outcome.success) {
        setFormState('success');
      } else {
        setFormError('Failed to route the inquiry. Please verify the connection and try again.');
        setFormState('idle');
      }
    } catch (err: any) {
      console.error('EmailJS submission error:', err);
      setFormError(err?.message || 'Could not reach the email services. Please verify your connection or try again.');
      setFormState('idle');
    }
  };

  const contactInfos = [
    {
      icon: MapPin,
      title: 'Our Location',
      desc: 'Q BENCH, Kerala, India'
    },
    {
      icon: Phone,
      title: 'Phone Number',
      desc: '+91 73565 25932'
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp Support',
      desc: 'Chat on WhatsApp',
      subDesc: '+91 73565 25932 • Available 24/7',
      link: 'https://wa.me/917356525932?text=Hello%20Q%20BENCH,%20I\'m%20interested%20in%20your%20services!'
    },
    {
      icon: Mail,
      title: 'Email Address',
      desc: 'qbench.official@gmail.com'
    },
    {
      icon: Globe,
      title: 'Website',
      desc: 'www.qbench.in'
    },
    {
      icon: Clock,
      title: 'Working Hours',
      desc: 'Mon - Sat: 9:30 AM - 6:30 PM',
      subDesc: 'Sunday: Closed'
    }
  ];

  const handleCtaClick = () => {
    // Scroll down to message form section
    const elem = document.getElementById('message-form-segment');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div id="contact-view-page" className="w-full">
      
      {/* 1. HERO HEADER BANER SECTION (DARK GREEN) */}
      <section id="contact-hero-banner" className="bg-[#05211c] text-white py-16 sm:py-20 px-6 lg:px-12 relative overflow-hidden select-none">
        
        {/* Soft background ambient gradient */}
        <div className="absolute top-[-150px] right-[-150px] w-[500px] h-[500px] rounded-full bg-[#00685b]/20 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[-100px] left-[-100px] w-96 h-96 rounded-full bg-[#45b88a]/5 blur-[100px] pointer-events-none" />
        
        <div className="mx-auto max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left informational segment */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8">
              <span id="contact-badge" className="font-tech text-xs tracking-widest text-[#88f8c5] font-extrabold uppercase bg-white/10 px-3.5 py-1 rounded-full inline-block">
                GET IN TOUCH
              </span>
              
              <h1 id="contact-hero-title" className="font-display text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight text-white">
                Let's Build Something <br className="hidden sm:block" />
                <span className="text-[#88f8c5]">Amazing Together.</span>
              </h1>
              
              <p id="contact-hero-subtitle" className="font-sans text-sm sm:text-base text-white/70 leading-relaxed max-w-xl">
                Have a project in mind or want to discuss how we can help your business grow? We'd love to hear from you.
              </p>
              
              {/* Bottom bullets layouts */}
              <div id="response-features" className="space-y-4 pt-4 border-t border-white/10 max-w-md">
                
                <div className="flex items-start space-x-3.5 group">
                  <div className="p-2.5 bg-white/10 text-[#88f8c5] rounded-xl flex items-center justify-center shrink-0">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-bold text-white transition-colors duration-200">Quick Response</h4>
                    <p className="font-sans text-xs text-white/60">We reply within 24 hours.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5 group">
                  <div className="p-2.5 bg-white/10 text-[#88f8c5] rounded-xl flex items-center justify-center shrink-0">
                    <Headphones className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-bold text-white transition-colors duration-200">Friendly Support</h4>
                    <p className="font-sans text-xs text-white/60">We are here to help you grow.</p>
                  </div>
                </div>

              </div>
            </div>
            
            {/* Right overlapping banner container (Promo card) */}
            <div className="lg:col-span-5">
              <div 
                id="contact-promo-box" 
                className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 relative hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01] overflow-hidden"
              >
                {/* Decorative image background placeholder - generic abstract office overlay */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=5')] opacity-5 bg-cover bg-center pointer-events-none" />
                
                <div className="h-10 w-10 bg-[#88f8c5]/15 text-[#88f8c5] rounded-xl flex items-center justify-center relative z-10 shrink-0">
                  <Sparkles className="h-5 w-5" />
                </div>
                
                <div className="space-y-2 relative z-10">
                  <h3 className="font-display text-lg sm:text-xl font-bold tracking-tight">
                    Ready to Grow Your Business?
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-white/75 leading-relaxed">
                    Let's create powerful strategies that increase visibility, generate leads, and drive growth.
                  </p>
                </div>
                
                <button
                  onClick={handleCtaClick}
                  className="w-full rounded-xl bg-[#00685b] hover:bg-[#178373] text-white py-3.5 font-display text-xs font-bold uppercase tracking-wider transition-colors duration-300 relative z-10 cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                >
                  <span>Start a Project</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* 2. CONTACT INFORMATION & FORM (WHITE BACKGROUND ROW) */}
      <section id="contact-workspace" className="bg-[#ffffff] py-20 px-6 lg:px-12 border-b border-brand-outline/20">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Left Column: Contact info cards */}
            <div id="contact-info-panel" className="lg:col-span-5 space-y-8">
              
              <div className="space-y-2.5">
                <h2 className="font-display text-2xl sm:text-3xl font-black text-brand-text tracking-tight">
                  Contact Information
                </h2>
                <p className="font-sans text-xs sm:text-sm text-brand-text-muted leading-relaxed">
                  We're here to help and answer any question you might have.
                </p>
              </div>
              
              {/* Vertical items map list */}
              <div className="space-y-5 pt-2">
                {contactInfos.map((info, idx) => {
                  const InfoIcon = info.icon;
                  const isLink = !!info.link;
                  const Wrapper = isLink ? 'a' : 'div';
                  const wrapperProps = isLink ? {
                    href: info.link,
                    target: '_blank',
                    rel: 'noreferrer'
                  } : {};
                  return (
                    <Wrapper 
                      id={`contact-info-item-${idx}`} 
                      key={idx} 
                      {...wrapperProps}
                      className={`flex items-start space-x-4 bg-[#faf9f9]/40 p-3.5 rounded-xl border border-brand-outline/10 hover:border-[#00685b]/20 transition-all duration-300 ${isLink ? 'hover:bg-[#25D366]/5 group cursor-pointer' : ''}`}
                    >
                      <span className={`p-2.5 rounded-lg flex items-center justify-center shrink-0 ${isLink ? 'bg-[#25D366]/10 text-[#128C7E] group-hover:bg-[#25D366] group-hover:text-white transition-colors duration-200' : 'bg-[#00685b]/5 text-[#00685b]'}`}>
                        <InfoIcon className="h-4.5 w-4.5" />
                      </span>
                      
                      <div className="space-y-0.5">
                        <h4 className="font-display text-xs font-black uppercase tracking-wider text-brand-text-muted">
                          {info.title}
                        </h4>
                        <p className={`font-sans text-xs font-bold ${isLink ? 'text-[#128C7E] group-hover:underline' : 'text-brand-text'}`}>
                          {info.desc}
                        </p>
                        {info.subDesc && (
                          <p className="font-sans text-[11px] text-brand-text-muted mt-0.5">
                            {info.subDesc}
                          </p>
                        )}
                      </div>
                    </Wrapper>
                  );
                })}
              </div>
              
            </div>
            
            {/* Right Column: Interaction form panel */}
            <div id="message-form-segment" className="lg:col-span-7">
              <div className="space-y-6">
                
                <div className="space-y-2.5">
                  <h3 className="font-display text-xl sm:text-2xl font-black text-brand-text tracking-tight">
                    Send Us a Message
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-brand-text-muted leading-relaxed">
                    Fill out the form below and we'll get back to you as soon as possible.
                  </p>
                </div>
                
                {formState === 'success' ? (
                  <div id="form-success-alert" className="bg-[#002f29]/5 border border-[#00685b]/25 rounded-2xl p-8 text-center space-y-4 animate-fade-in">
                    <span className="h-14 w-14 bg-[#00685b]/10 text-[#00685b] rounded-full flex items-center justify-center text-2xl mx-auto font-black font-mono">
                      ✓
                    </span>
                    
                    <h4 className="font-display text-lg font-bold text-[#002f29]">Inquiry Received Perfectly</h4>
                    
                    <p className="font-sans text-xs text-brand-text-muted leading-relaxed max-w-md mx-auto">
                      Thank you for contacting QBench. Our team will get back to you within 24 hours.
                    </p>
                    
                    <button 
                      onClick={() => {
                        setFormData({
                          name: '',
                          phone: '',
                          email: '',
                          company: '',
                          service: 'Branding',
                          message: ''
                        });
                        setFormState('idle');
                      }}
                      className="text-xs font-tech font-extrabold text-[#00685b] hover:underline pt-2 block mx-auto cursor-pointer"
                    >
                      Click to send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    
                    {/* Security Spam Protection - Honeypot Field */}
                    <div className="absolute top-0 left-0 w-0 h-0 overflow-hidden pointer-events-none opacity-0" aria-hidden="true">
                      <input 
                        type="text" 
                        name="website_dummy_spambot" 
                        tabIndex={-1} 
                        value={honeypot} 
                        onChange={(e) => setHoneypot(e.target.value)}
                        placeholder="Do not fill this if you are human" 
                      />
                    </div>

                    {formError && (
                      <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-start gap-2.5">
                        <span className="text-sm shrink-0">⚠️</span>
                        <div className="space-y-0.5">
                          <p className="font-bold">Submission Error</p>
                          <p className="text-red-700/90 leading-relaxed">{formError}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Name & Business grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-tech text-brand-text-muted uppercase font-bold tracking-wider">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="Your full name"
                          className="w-full bg-[#faf9f9]/70 border border-brand-outline/25 rounded-xl px-4 py-2.5 text-xs text-brand-text placeholder-brand-text-muted/30 focus:outline-none focus:border-[#00685b] focus:bg-white transition-colors"
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-tech text-brand-text-muted uppercase font-bold tracking-wider">Company Name</label>
                        <input
                          type="text"
                          value={formData.company}
                          onChange={(e) => setFormData({...formData, company: e.target.value})}
                          placeholder="Name of your company / enterprise"
                          className="w-full bg-[#faf9f9]/70 border border-brand-outline/25 rounded-xl px-4 py-2.5 text-xs text-brand-text placeholder-brand-text-muted/30 focus:outline-none focus:border-[#00685b] focus:bg-white transition-colors"
                        />
                      </div>
                      
                    </div>
                    
                    {/* Phone & Email grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-tech text-brand-text-muted uppercase font-bold tracking-wider">Phone Number *</label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          placeholder="Include country code"
                          className="w-full bg-[#faf9f9]/70 border border-brand-outline/25 rounded-xl px-4 py-2.5 text-xs text-brand-text placeholder-brand-text-muted/30 focus:outline-none focus:border-[#00685b] focus:bg-white transition-colors"
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-tech text-brand-text-muted uppercase font-bold tracking-wider">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="name@company.com"
                          className="w-full bg-[#faf9f9]/70 border border-brand-outline/25 rounded-xl px-4 py-2.5 text-xs text-brand-text placeholder-brand-text-muted/30 focus:outline-none focus:border-[#00685b] focus:bg-white transition-colors"
                        />
                      </div>
                      
                    </div>
                    
                    {/* Service Required Select */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-tech text-brand-text-muted uppercase font-bold tracking-wider">Service Required *</label>
                      <select
                        required
                        value={formData.service}
                        onChange={(e) => setFormData({...formData, service: e.target.value})}
                        className="w-full bg-[#faf9f9]/70 border border-brand-outline/25 rounded-xl px-4 py-2.5 text-xs text-brand-text focus:outline-none focus:border-[#00685b] focus:bg-white transition-colors appearance-none cursor-pointer"
                        style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2300685b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
                      >
                        <option value="Branding">Branding & Identity</option>
                        <option value="Social Media Design">Social Media Design</option>
                        <option value="Video Editing">Video Editing</option>
                        <option value="Digital Marketing">Digital Marketing</option>
                        <option value="UI/UX Design">UI/UX Design</option>
                        <option value="Web Development">Web Development</option>
                        <option value="Motion Graphics">Motion Graphics</option>
                        <option value="Business Support">Business Support</option>
                        <option value="Other">Other Inquiry</option>
                      </select>
                    </div>
                    
                    {/* Message description box */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-tech text-brand-text-muted uppercase font-bold tracking-wider">Your Message *</label>
                      <textarea
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        placeholder="Please write your detailed query or project description here..."
                        className="w-full bg-[#faf9f9]/70 border border-brand-outline/25 rounded-xl px-4 py-3 text-xs text-brand-text placeholder-brand-text-muted/30 focus:outline-none focus:border-[#00685b] focus:bg-white transition-colors resize-none"
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={formState === 'submitting'}
                      className="w-full sm:w-auto rounded-xl bg-[#00685b] hover:bg-[#178373] text-white px-8 py-3.5 font-display text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
                    >
                      {formState === 'submitting' ? (
                        <>
                          <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          <span>Sending to QBench...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Message</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                    
                  </form>
                )}

                {/* SMTP Connection Diagnostics Console Panel */}
                <div id="smtp-diag-card" className="mt-8 pt-6 border-t border-brand-outline/15 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-5 w-5 rounded-full bg-[#00685b]/10 text-[#00685b] flex items-center justify-center text-xs">🛠️</span>
                      <span className="text-[11px] font-mono uppercase tracking-wider font-extrabold text-brand-text">Gmail SMTP Diagnostics</span>
                    </div>
                    <button
                      type="button"
                      disabled={smtpChecking}
                      onClick={testSmtpConnection}
                      className="text-[10px] font-sans font-bold bg-[#faf9f9] border border-brand-outline/20 hover:border-[#00685b] text-[#00685b] px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer disabled:opacity-50"
                    >
                      {smtpChecking ? 'Handshaking...' : 'Run SMTP Test'}
                    </button>
                  </div>
                  
                  {smtpResult && (
                    <div className={`p-4 rounded-xl border text-xs space-y-2 animate-fade-in ${
                      smtpResult.success 
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' 
                        : 'bg-rose-50/70 border-rose-200 text-rose-900'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className={`text-base leading-none ${smtpResult.success ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {smtpResult.success ? '✅' : '❌'}
                        </span>
                        <p className="font-bold font-sans">
                          {smtpResult.success ? 'SMTP Connection Ok!' : 'SMTP Connection Failed'}
                        </p>
                      </div>
                      
                      <p className="font-sans text-[11px] leading-relaxed opacity-90">{smtpResult.message}</p>
                      
                      {smtpResult.details && (
                        <div className="bg-white/60 p-2 rounded-lg font-mono text-[10px] text-slate-700 border border-slate-200/50 space-y-0.5">
                          <div><span className="font-bold text-slate-500">Host:</span> {smtpResult.details.host}</div>
                          <div><span className="font-bold text-slate-500">Port:</span> {smtpResult.details.port} ({smtpResult.details.ssl ? 'SSL' : 'TLS'})</div>
                          <div><span className="font-bold text-slate-500">Sender:</span> {smtpResult.details.user}</div>
                        </div>
                      )}
                      
                      {smtpResult.error && (
                        <div className="bg-red-950/5 text-red-900 p-2.5 rounded-lg font-mono text-[10px] leading-relaxed border border-red-900/10 whitespace-pre-wrap">
                          <span className="font-bold text-red-800">Error Payload:</span> {smtpResult.error}
                          {smtpResult.code && <div><span className="font-bold text-red-800">Code:</span> {smtpResult.code}</div>}
                        </div>
                      )}
                      
                      {smtpResult.advice && (
                        <div className="bg-amber-50 text-amber-900 p-3 rounded-lg font-sans text-[11px] leading-relaxed border border-amber-200">
                          <p className="font-bold text-amber-800 flex items-center gap-1.5 mb-1">
                            <span>💡</span> Gmail Integration Advice:
                          </p>
                          <p>{smtpResult.advice}</p>
                          <ul className="list-disc pl-4 mt-1.5 space-y-1 text-amber-800/90 text-[10px]">
                            <li>Go to <strong>Google Account Settings &gt; Security</strong></li>
                            <li>Enable <strong>2-Step Verification</strong></li>
                            <li>Generate an <strong>App Password</strong></li>
                            <li>Set this 16-character string as the <strong>SMTP_PASS</strong> value in your settings secrets page.</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* 3. COCHIN/KERALA METROPOLITAN VECTOR MAP BLOCK */}
      <section id="contact-map-block" className="mx-auto max-w-7xl px-6 py-20 lg:px-12">
        <div id="map-con-grid" className="bg-[#fafaf9] border border-brand-outline/20 rounded-3xl overflow-hidden p-6 sm:p-10 flex flex-col lg:grid lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Styled Cochin vector street map layout diagram */}
          <div className="lg:col-span-7 w-full aspect-[4/3] rounded-2.5xl bg-[#ededec] border border-slate-300 relative overflow-hidden select-none shadow-inner">
            
            {/* Custom street network visual SVG */}
            <svg className="absolute inset-0 w-full h-full text-slate-400 stroke-slate-300/80 fill-none" viewBox="0 0 400 300">
              
              {/* Soft background visual styling water flow (Vembanad Lake / River delta layout) */}
              <path d="M-10,120 Q50,110 80,180 T150,230 T200,310 L-10,310 Z" fill="#d0e2e2" stroke="none" />
              <path d="M75,178 L35,240 T0,280" stroke="#d0e2e2" strokeWidth="8" />
              
              {/* Main Expressway Arteries represent Cochin bypass */}
              <path d="M50,-10 L120,80 L220,170 T350,310" stroke="#fcfcfc" strokeWidth="6" />
              <path d="M50,-10 L120,80 L220,170 T350,310" stroke="#e0aa62" strokeWidth="1.5" /> {/* NH66 Bypass highway representation */}
              
              <path d="M-20,60 L420,190" stroke="#fcfcfc" strokeWidth="4" />
              <path d="M-20,60 L420,190" stroke="#cbd5e1" strokeWidth="1" />
              
              <path d="M120,80 Q220,50 310,120 T390,190" stroke="#fcfcfc" strokeWidth="4" />
              <path d="M120,80 Q220,50 310,120 T390,190" stroke="#e2e8f0" strokeWidth="1" />
              
              {/* Secondary roads grid vectors */}
              <line x1="80" y1="20" x2="160" y2="140" stroke="#f3f4f6" strokeWidth="2.5" />
              <line x1="150" y1="250" x2="300" y2="250" stroke="#f3f4f6" strokeWidth="2.5" />
              <line x1="310" y1="120" x2="310" y2="240" stroke="#f3f4f6" strokeWidth="2.5" />
              
              {/* Landmark point rings */}
              <circle cx="120" cy="80" r="1.5" fill="#64748b" />
              <circle cx="220" cy="170" r="1.5" fill="#64748b" />
              <circle cx="310" cy="120" r="1.5" fill="#64748b" />
              
            </svg>
            
            {/* Custom Street Address Marker labels on Cochin Map view */}
            <div className="absolute top-[22%] left-[32%] text-[9px] font-sans font-bold text-slate-500 tracking-tight leading-none bg-white/70 px-1 py-0.5 rounded shadow-xs select-none">
              Edapally
            </div>
            
            <div className="absolute top-[48%] left-[45%] text-[9px] font-sans font-bold text-slate-500 tracking-tight leading-none bg-white/70 px-1 py-0.5 rounded shadow-xs select-none">
              Palarivattom
            </div>
            
            <div className="absolute top-[40%] left-[81%] text-[9px] font-sans font-bold text-slate-600 tracking-tight leading-none bg-white/70 px-1 py-0.5 rounded shadow-xs select-none">
              Kakkanad InfoPark
            </div>

            <div className="absolute bottom-[23%] left-[75%] text-[8px] font-sans font-bold text-red-500 tracking-tight leading-none flex items-center gap-1.5 select-none bg-white/70 p-1 rounded">
              <span className="h-1 w-1 bg-red-500 rounded-full inline-block animate-ping" /> Aster Medcity
            </div>

            <div className="absolute bottom-[10%] left-[35%] text-[9px] font-sans font-bold text-slate-500 tracking-tight leading-none bg-white/70 px-1 py-0.5 rounded shadow-xs select-none">
              Lulu Mall
            </div>
            
            {/* Active Bouncing Pin representing Q BENCH office */}
            <div className="absolute top-[62%] left-[46%] -translate-x-1/2 -translate-y-full flex flex-col items-center">
              
              {/* Ambient beacon ring */}
              <div className="absolute bottom-1 w-6 h-1 w-3.5 h-1.5 bg-black/20 rounded-full blur-[1px] animate-pulse" />
              
              {/* Pin indicator body */}
              <div className="relative animate-bounce duration-1000 flex flex-col items-center select-none cursor-pointer">
                <MapPin className="h-7 w-7 text-[#00685b] fill-[#88f8c5] drop-shadow-md" />
                <span className="absolute top-1.5 h-1.5 w-1.5 bg-[#00685b] rounded-full" />
              </div>
              
              <div className="mt-1 bg-[#002f29] text-white text-[8px] font-tech font-bold uppercase tracking-widest px-2 py-0.5 rounded shadow-md border border-white/20 leading-none shrink-0 whitespace-nowrap">
                Q BENCH Cochin
              </div>
            </div>

          </div>
          
          {/* Right Column: Invite to Consultation Action block */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Circular Paperplane launcher */}
            <div className="h-14 w-14 rounded-full bg-[#002f29] p-3 text-[#88f8c5] flex items-center justify-center shrink-0 shadow-md">
              <Send className="h-6 w-6" />
            </div>
            
            <div className="space-y-2.5">
              <h3 className="font-display text-xl sm:text-2xl font-black text-brand-text tracking-tight">
                Let's Start a Conversation
              </h3>
              <p className="font-sans text-xs sm:text-sm text-brand-text-muted leading-relaxed">
                We're excited to learn more about your business and help you achieve your goals. Connect with our advisors to schedule a visual blueprint layout audit.
              </p>
            </div>
            
            <div className="pt-2 border-t border-brand-outline/10">
              <button 
                onClick={() => {
                  if (onNavigate) {
                    onNavigate('contact');
                  }
                  handleCtaClick();
                }}
                className="rounded-xl border border-brand-text bg-white text-brand-text px-6 py-3 font-display text-xs font-bold uppercase tracking-wider hover:bg-brand-surface-low transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
              >
                <span>Book a Free Consultation</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
            
          </div>
          
        </div>
      </section>

    </div>
  );
}
