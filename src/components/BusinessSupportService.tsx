import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Briefcase, 
  BookOpen, 
  Sliders, 
  CheckCircle2, 
  Award, 
  Coins, 
  Calculator, 
  ArrowUpRight, 
  FileText, 
  Database, 
  Users, 
  Plane, 
  Check, 
  Plus
} from 'lucide-react';

export default function BusinessSupportService() {
  const [selectedServices, setSelectedServices] = useState<string[]>([
    'Accounting & Finance', 
    'Excel & Data Management'
  ]);
  const [hoursPerDay, setHoursPerDay] = useState<number>(4);

  const supportCategories = [
    {
      id: 'accounting',
      title: 'Accounting & Finance',
      icon: Coins,
      tag: '01 / FINANCE',
      items: [
        'Daily Bookkeeping',
        'Accounts Payable & Receivable',
        'Ledger Management',
        'Bank Reconciliation',
        'GST, TDS & Tax Support',
        'Payroll Processing',
        'Financial Reports & MIS',
        'Budgeting & Cash Flow Management',
      ]
    },
    {
      id: 'excel',
      title: 'Excel & Data Management',
      icon: Sliders,
      tag: '02 / ANALYTICS',
      items: [
        'Advanced Excel Solutions',
        'Dashboard Creation',
        'MIS & Business Reports',
        'Data Analysis & Visualization',
        'Spreadsheet Automation',
        'Data Cleaning & Formatting',
        'Custom Business Templates',
      ]
    },
    {
      id: 'data-entry',
      title: 'Data Entry & Documentation',
      icon: Database,
      tag: '03 / DATABASE',
      items: [
        'Online & Offline Data Entry',
        'CRM Data Management',
        'Invoice Entry & Processing',
        'Record Maintenance',
        'Database Creation & Updates',
        'Document Digitization',
        'Form Processing',
      ]
    },
    {
      id: 'billing',
      title: 'Billing & Administrative Support',
      icon: FileText,
      tag: '04 / BILLING',
      items: [
        'Invoice Generation',
        'Quotation Preparation',
        'Purchase Order Management',
        'Billing & Collection Tracking',
        'Vendor Documentation',
        'Administrative Assistance',
        'Report Preparation',
      ]
    },
    {
      id: 'customer',
      title: 'Customer Support Services',
      icon: Users,
      tag: '05 / CUSTOMER ops',
      items: [
        'Customer Inquiry Handling',
        'Email & Chat Support',
        'Lead Management',
        'Appointment Scheduling',
        'Customer Follow-ups',
        'CRM Updates',
        'Customer Relationship Management',
      ]
    },
    {
      id: 'travel',
      title: 'Travel & Itinerary Management',
      icon: Plane,
      tag: '06 / PLANNING',
      items: [
        'Business Travel Planning',
        'Tour Itinerary Preparation',
        'Hotel & Transportation Coordination',
        'Event Scheduling',
        'Meeting & Appointment Planning',
        'Travel Documentation Support',
      ]
    },
    {
      id: 'compliance',
      title: 'Business Compliance & Registration',
      icon: Award,
      tag: '07 / COMPLIANCE',
      items: [
        'GST Registration & Filing',
        'MSME / Udyam Registration',
        'Company Formation Support',
        'ROC Compliance Assistance',
        'Regulatory Documentation',
      ]
    },
    {
      id: 'loan',
      title: 'Loan & Funding Support',
      icon: Briefcase,
      tag: '08 / CAPITAL SUPPORT',
      items: [
        'Business Loan Documentation',
        'Home & Personal Loan Assistance',
        'Project Report Preparation',
        'Financial Projections',
        'Funding Documentation',
      ]
    }
  ];

  const whyChooseReasons = [
    'Cost-Effective Outsourcing',
    'Dedicated Support Team',
    'Accurate & Confidential Data Handling',
    'Faster Business Operations',
    'Customized Solutions for Every Business',
    'Scalable Support as Your Business Grows'
  ];

  const handleToggleService = (serviceTitle: string) => {
    if (selectedServices.includes(serviceTitle)) {
      setSelectedServices(selectedServices.filter(s => s !== serviceTitle));
    } else {
      setSelectedServices([...selectedServices, serviceTitle]);
    }
  };

  // Cost calculation
  // Let us assume in India, on-premise dedicated backoffice employee costs roughly ₹350 per hr
  // Outsourcing to Q Bench has massive discount scaled by hours, averaging ₹180 per hr.
  const selectedCount = selectedServices.length;
  const domesticCost = hourlyCalculation(hoursPerDay, 20, selectedCount, 320); 
  const outsourcedCost = hourlyCalculation(hoursPerDay, 20, selectedCount, 150);
  const monthlySavings = domesticCost - outsourcedCost;

  function hourlyCalculation(hours: number, days: number, multiplyingFactor: number, rate: number) {
    const minHours = hours * days;
    const factor = Math.max(1, multiplyingFactor * 0.7);
    return Math.round(minHours * factor * rate);
  }

  return (
    <div id="tab-business-support-content" className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 animate-fade-in w-full">
      <div className="md:col-span-7 space-y-8">
        {/* Main Pitch */}
        <div className="space-y-4">
          <span className="font-tech text-[10px] tracking-widest text-[#00685b] font-bold uppercase flex items-center gap-1.5 bg-[#00685b]/10 w-fit px-2.5 py-1 rounded-full">
            <Briefcase className="h-3.5 w-3.5" /> BUSINESS SUPPORT
          </span>
          <h3 className="font-display text-2xl sm:text-3xl font-black text-brand-text">
            Back Office Operations<span className="text-brand-accent">.</span>
          </h3>
          <p className="font-sans text-xs text-[#374151] leading-relaxed">
            Outsource specialized day-to-day administrative tasks, books keeping, and advanced excel spreadsheet setups to save significant internal overhead.
          </p>
        </div>

        {/* Categories Grid (Accordion style / clean list) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {supportCategories.map((cat) => {
            const CatIcon = cat.icon;
            const isChecked = selectedServices.includes(cat.title);
            return (
              <div 
                key={cat.id}
                id={`support-cat-${cat.id}`}
                className={`space-y-2 border rounded-xl p-4 transition-all duration-200 bg-white flex flex-col justify-between ${
                  isChecked 
                    ? 'border-[#00685b] ring-1 ring-[#00685b]' 
                    : 'border-brand-outline/20 hover:border-[#00685b]/40 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2 text-[#00685b]">
                      <span className="p-1.5 bg-[#00685b]/5 rounded">
                        <CatIcon className="h-4 w-4" />
                      </span>
                      <span className="font-tech text-[9px] tracking-wider font-bold uppercase">{cat.tag}</span>
                    </div>
                    {/* Multi-select check for calculator */}
                    <button 
                      onClick={() => handleToggleService(cat.title)}
                      className={`h-4.5 w-4.5 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
                        isChecked 
                          ? 'bg-[#00685b] text-white' 
                          : 'border border-brand-outline/25 hover:border-[#00685b]'
                      }`}
                    >
                      {isChecked ? <Check className="h-2.5 w-2.5" /> : <Plus className="h-2.5 w-2.5 text-brand-text-muted" />}
                    </button>
                  </div>
                  
                  <h4 className="font-display text-xs font-bold text-brand-text mb-1.5">{cat.title}</h4>
                  
                  {/* List of sub-items - clean, minimal and plain bullet text */}
                  <ul className="space-y-1 pl-1">
                    {cat.items.slice(0, 4).map((item, idx) => (
                      <li key={idx} className="flex items-start text-[10.5px] text-brand-text-muted font-sans leading-relaxed">
                        <span className="h-1 w-1 bg-[#00685b] rounded-full mr-1.5 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Why Choose Us checklist */}
        <div id="support-why-choose" className="bg-brand-surface-low border border-brand-outline/20 rounded-2xl p-5 space-y-4">
          <div className="flex items-center space-x-2 border-b border-brand-outline/10 pb-2.5">
            <BookOpen className="h-4 w-4 text-[#00685b]" />
            <h4 className="font-display text-[10px] font-bold text-brand-text uppercase tracking-wider">
              Why Outsource Business Operations?
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {whyChooseReasons.map((reason, rIdx) => (
              <div key={rIdx} className="flex items-start space-x-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <p className="font-sans text-[11px] text-brand-text leading-relaxed">{reason}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[9px] font-display pt-2.5 border-t border-[#00685b]/10 text-brand-text-muted">
            <span className="font-tech font-bold uppercase">NDA TRUST //</span>
            <span className="font-medium text-brand-text font-sans">100% Encrypted Security and Strict NDA standards enforced</span>
          </div>
        </div>
      </div>

      {/* Right Side Card Panel - Savings Estimator */}
      <div className="md:col-span-5 bg-white border border-brand-outline/35 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-6 self-start sticky top-24">
        <div className="space-y-4 w-full">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold font-tech tracking-wider text-[#00685b] uppercase">Operational Hub</span>
            <span className="bg-[#00685b]/10 text-[#00685b] text-[8px] font-bold px-2 py-0.5 rounded-full font-tech">SAVINGS CALCULATOR</span>
          </div>

          <p className="text-xs text-brand-text-muted leading-relaxed font-sans mb-2">
            Select the service cards on the left and adjust operational hours to calculate estimated domestic vs outsourced monthly costs.
          </p>

          <div className="bg-brand-surface-low rounded-xl p-4 space-y-4 border border-brand-outline/15">
            <div>
              <div className="flex justify-between items-center mb-1">
                <p className="text-[9px] font-bold text-brand-text-muted uppercase tracking-widest flex items-center gap-1">
                  <Calculator className="h-3.5 w-3.5 text-[#00685b]" /> Dedicated Hours Required / Day
                </p>
                <span className="text-xs font-bold text-[#00685b] font-mono">{hoursPerDay} Hrs/Day</span>
              </div>
              <input
                type="range"
                min="2"
                max="12"
                step="1"
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(Number(e.target.value))}
                className="w-full accent-[#00685b] cursor-pointer"
              />
              <div className="flex justify-between text-[8px] text-brand-text-muted font-mono mt-0.5">
                <span>2 Hrs</span>
                <span>12 Hrs</span>
              </div>
            </div>

            <div className="border-t border-brand-outline/10 pt-3">
              <span className="text-[9px] font-bold text-brand-text-muted uppercase tracking-widest block mb-1">Active Blocks Chosen</span>
              <p className="text-xs font-bold text-brand-text font-sans">
                {selectedCount} Support Service Block{selectedCount === 1 ? '' : 's'} Selected
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <h4 className="font-display text-[10px] text-brand-text-muted uppercase tracking-widest font-bold">Estimated Monthly Comparison</h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="border border-brand-outline/20 rounded-xl p-3 bg-red-50/40">
                <p className="text-[9px] font-bold text-red-700/65 uppercase tracking-wider">In-House Staff</p>
                <p className="text-sm font-bold text-red-950 font-mono mt-0.5">
                  {selectedCount === 0 ? '₹0' : `₹${domesticCost.toLocaleString('en-IN')}`}
                </p>
                <span className="text-[8px] text-brand-text-muted font-sans font-medium block">Average In-House Cost</span>
              </div>

              <div className="border border-[#00685b]/30 rounded-xl p-3 bg-[#00685b]/5">
                <p className="text-[9px] font-bold text-[#00685b] uppercase tracking-wider">Our Outsourced</p>
                <p className="text-sm font-bold text-brand-text font-mono mt-0.5 text-[#00685b]">
                  {selectedCount === 0 ? '₹0' : `₹${outsourcedCost.toLocaleString('en-IN')}`}
                </p>
                <span className="text-[8px] text-brand-text-muted font-sans font-medium block">Fixed Package Rate</span>
              </div>
            </div>

            {selectedCount > 0 && (
              <div className="border border-emerald-200/50 rounded-xl p-3 bg-emerald-50/50 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold text-emerald-800 uppercase tracking-wider">Estimated Monthly Savings</p>
                  <p className="text-md sm:text-lg font-black text-emerald-700 font-mono mt-0.5">
                    ₹{monthlySavings.toLocaleString('en-IN')} / Mo
                  </p>
                </div>
                <div className="w-10 h-10 flex items-center justify-end">
                  <ArrowUpRight className="h-5 w-5 text-emerald-600 animate-pulse" />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-brand-surface rounded-xl p-3 border border-brand-outline/10">
          <p className="font-display text-[9px] leading-relaxed text-brand-text-variant italic">
            "By outsourcing operations to dedicated support cells, business owners reclaim up to 25 valuable hours weekly."
          </p>
        </div>
      </div>
    </div>
  );
}
