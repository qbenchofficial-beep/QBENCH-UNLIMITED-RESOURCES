import { useState } from 'react';
import { motion } from 'motion/react';
import { PORTFOLIO_PROJECTS } from '../data';
import { NavSection } from '../types';
import { ArrowUpRight } from 'lucide-react';

interface PortfolioViewProps {
  onNavigate: (section: NavSection) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 22, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
      mass: 0.8
    }
  }
};

export default function PortfolioView({ onNavigate }: PortfolioViewProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'branding' | 'biotech' | 'ecosystems' | 'motion'>('all');

  const filters: { id: 'all' | 'branding' | 'biotech' | 'ecosystems' | 'motion'; label: string }[] = [
    { id: 'all', label: 'All Works' },
    { id: 'branding', label: 'Branding' },
    { id: 'biotech', label: 'Biotech' },
    { id: 'ecosystems', label: 'Ecosystems' },
    { id: 'motion', label: 'Motion' }
  ];

  const filteredProjects = activeFilter === 'all'
    ? PORTFOLIO_PROJECTS
    : PORTFOLIO_PROJECTS.filter(project => project.category === activeFilter);

  return (
    <div id="portfolio-view" className="mx-auto max-w-7xl px-6 py-12 lg:px-12 lg:py-16 space-y-16">
      
      {/* Title + Filter Chips Bar */}
      <div id="portfolio-headline-segment" className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 pb-2 border-b border-brand-outline/20">
        <div className="space-y-4 max-w-2xl">
          <span className="font-tech text-xs tracking-widest text-brand-primary font-bold uppercase">
            PORTFOLIO
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-brand-text">
            Selected <span className="text-brand-primary">Case Studies</span>
          </h1>
          <p className="font-display text-xs sm:text-sm text-brand-text-muted">
            Explore how we align high-performance code structures with artistic visuals to construct remarkable brand portals.
          </p>
        </div>

        {/* Filter chips list */}
        <div id="portfolio-filters" className="flex flex-wrap gap-2 pt-2 lg:pt-0">
          {filters.map((filter) => {
            const isActive = activeFilter === filter.id;
            return (
              <button
                id={`filter-chip-${filter.id}`}
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-2 font-display text-xs font-bold rounded-lg tracking-wide border transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-brand-primary text-white border-brand-primary shadow-sm scale-102'
                    : 'bg-white border-brand-outline/30 text-brand-text-muted hover:text-brand-text hover:border-brand-outline/65'
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Projects Grid Display */}
      {filteredProjects.length > 0 ? (
        <motion.div 
          id="portfolio-projects-grid" 
          key={activeFilter}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12"
        >
          {filteredProjects.map((project) => (
            <motion.div 
              id={`portfolio-card-${project.id}`}
              key={project.id}
              variants={itemVariants}
              whileHover={{ y: -6, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } }}
              className="group flex flex-col justify-between space-y-4 bg-white border border-brand-outline/25 hover:border-brand-outline rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="space-y-4">
                {/* Image panel with zoom scale on hover */}
                <div className="aspect-[16/10] w-full rounded-xl overflow-hidden relative border border-brand-outline/10 bg-brand-surface-low">
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-full object-cover grayscale brightness-95 contrast-102 group-hover:grayscale-0 group-hover:scale-103 transition-all duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="font-tech text-[10px] tracking-wider text-brand-primary font-bold uppercase bg-brand-accent-light/50 border border-brand-accent/20 px-2.5 py-0.5 rounded-full">
                    {project.categoryLabel}
                  </span>
                  <span className="font-tech text-[10px] text-brand-text-muted font-bold">
                    {project.year}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-display text-2xl font-black text-brand-text group-hover:text-brand-primary transition-colors duration-200">
                    {project.title}
                  </h3>
                  <p className="font-display text-sm text-brand-text-variant leading-relaxed">
                    {project.subtitle}
                  </p>
                </div>
              </div>

              {/* Read study CTA */}
              <div className="pt-4 border-t border-brand-outline/10 flex items-center justify-between">
                <button
                  id={`read-study-btn-${project.id}`}
                  onClick={() => onNavigate('contact')}
                  className="font-display text-xs font-bold text-brand-primary hover:text-brand-primary-light flex items-center space-x-1 cursor-pointer"
                >
                  <span>Inquire for Similar Blueprint</span>
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div id="no-projects-view" className="text-center py-20 border border-dashed border-brand-outline/30 rounded-2xl bg-white space-y-4">
          <span className="text-brand-text-muted font-display text-sm">No specific works fit this dynamic criteria yet.</span>
          <br />
          <button 
            onClick={() => setActiveFilter('all')}
            className="rounded-xl px-4 py-2 font-display text-xs font-semibold bg-brand-primary text-white hover:bg-brand-primary-light cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Philosophy: Design as an Ecosystem */}
      <section id="ecosystem-manifesto" className="bg-brand-surface-low border border-brand-outline/25 rounded-3xl p-8 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <h2 id="manifesto-title" className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-text">
              Design as an <span className="text-brand-primary">Ecosystem<span className="text-brand-accent">.</span></span>
            </h2>
            <p id="manifesto-desc" className="font-display text-sm sm:text-base text-brand-text-variant leading-relaxed">
              We do not view web templates as dead text layers. To us, every portal, landing, and server is a living, digital organism. When you coordinate with QBench, we architect assets that self-sustain, adapt to user habits, and gracefully grow alongside your corporate maturity.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-brand-accent" />
                <span className="font-tech text-xs text-brand-text font-bold">MUTUAL DEPLOYMENT</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-brand-accent" />
                <span className="font-tech text-xs text-brand-text font-bold">REDUCED COGNITIVE HEAT</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-brand-accent" />
                <span className="font-tech text-xs text-brand-text font-bold">ORGANIC TYPOGRAPHIC SCORING</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative overflow-hidden rounded-2xl border border-brand-outline/25 bg-white shadow-sm group">
            <img
              src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"
              alt="Glow electric motherboards green wires"
              className="w-full aspect-[4/3] object-cover grayscale brightness-95 group-hover:scale-103 group-hover:grayscale-0 transition-all duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/10 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      </section>
    </div>
  );
}
