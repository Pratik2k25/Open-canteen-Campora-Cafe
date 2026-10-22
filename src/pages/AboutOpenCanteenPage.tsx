import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  UtensilsCrossed,
  Heart,
  Code2,
  ShieldCheck,
  Users,
  ChevronRight,
  ChevronDown,
  Info,
  GitBranch,
  ExternalLink,
  CheckCircle2,
  Lock,
  Globe,
  Sparkles,
} from 'lucide-react';
import { OpenCanteenBrandMark } from '../components/OpenCanteenBrandMark.tsx';

export const AboutOpenCanteenPage: React.FC = () => {
  const navigate = useNavigate();

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    project: true,
    contribute: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="min-h-screen bg-[#F5F8FB] text-[#111827] flex flex-col items-center">
      <div className="w-full max-w-[430px] min-h-screen flex flex-col relative shadow-sm bg-[#F5F8FB] pb-16">
        {/* TOP STICKY HEADER */}
        <header className="sticky top-0 z-30 px-4 py-3 bg-white/95 backdrop-blur-md border-b border-neutral-100 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/profile'))}
              aria-label="Go back"
              className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200/80 flex items-center justify-center text-[#111827] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-[16px] font-bold text-[#111827] tracking-tight leading-none">
                About Open Canteen
              </h1>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                Open-Source Platform &amp; Community
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <OpenCanteenBrandMark variant="icon" theme="light" className="h-5 w-auto" />
          </div>
        </header>

        {/* MAIN BODY */}
        <main className="flex-1 p-3.5 sm:p-4 space-y-3.5">
          {/* BRAND HERO */}
          <div className="bg-white rounded-[20px] p-5 border border-neutral-100/90 shadow-[0_2px_10px_rgba(15,23,42,0.03)] relative overflow-hidden text-center flex flex-col items-center">
            {/* Ambient emerald glow */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

            {/* Fork & Knife Badge */}
            <div className="w-14 h-14 rounded-2xl bg-[#EBFAF0] border border-[#D1F2DD] flex items-center justify-center shadow-xs relative z-10 mb-3">
              <UtensilsCrossed className="w-7 h-7 text-[#16A34A]" />
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <h2 className="text-[20px] font-bold text-[#111827] tracking-tight">
                Open Canteen
              </h2>
              <p className="text-[13px] text-[#64748B] mt-1 max-w-[280px] leading-snug">
                Better Canteens. Smarter Experiences.
              </p>
              <div className="mt-2.5">
                <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full bg-neutral-100 text-[#475569] border border-neutral-200">
                  <Sparkles className="w-3 h-3 text-[#16A34A]" />
                  Open-source project
                </span>
              </div>
            </div>
          </div>

          {/* 2x2 FEATURE GRID */}
          <div className="grid grid-cols-2 gap-2 text-left">
            {/* Card 1: Our Mission */}
            <div className="bg-white p-3.5 rounded-[18px] border border-neutral-100/90 shadow-[0_2px_10px_rgba(15,23,42,0.03)] flex flex-col gap-1.5">
              <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500">
                <Heart className="w-4 h-4 text-rose-500" />
              </div>
              <div>
                <strong className="text-[12.5px] font-bold text-[#111827] block">Our Mission</strong>
                <span className="text-[11px] text-[#64748B] leading-tight block mt-0.5">
                  Better everyday food experiences
                </span>
              </div>
            </div>

            {/* Card 2: Open Source */}
            <div className="bg-white p-3.5 rounded-[18px] border border-neutral-100/90 shadow-[0_2px_10px_rgba(15,23,42,0.03)] flex flex-col gap-1.5">
              <div className="w-7 h-7 rounded-lg bg-[#EBFAF0] flex items-center justify-center text-[#16A34A]">
                <Code2 className="w-4 h-4 text-[#16A34A]" />
              </div>
              <div>
                <strong className="text-[12.5px] font-bold text-[#111827] block">Open Source</strong>
                <span className="text-[11px] text-[#64748B] leading-tight block mt-0.5">
                  Transparent and adaptable
                </span>
              </div>
            </div>

            {/* Card 3: Independence */}
            <div className="bg-white p-3.5 rounded-[18px] border border-neutral-100/90 shadow-[0_2px_10px_rgba(15,23,42,0.03)] flex flex-col gap-1.5">
              <div className="w-7 h-7 rounded-lg bg-[#EBF5FF] flex items-center justify-center text-[#0679FC]">
                <ShieldCheck className="w-4 h-4 text-[#0679FC]" />
              </div>
              <div>
                <strong className="text-[12.5px] font-bold text-[#111827] block">Independence</strong>
                <span className="text-[11px] text-[#64748B] leading-tight block mt-0.5">
                  Operator-controlled deployments
                </span>
              </div>
            </div>

            {/* Card 4: Community */}
            <div className="bg-white p-3.5 rounded-[18px] border border-neutral-100/90 shadow-[0_2px_10px_rgba(15,23,42,0.03)] flex flex-col gap-1.5">
              <div className="w-7 h-7 rounded-lg bg-[#FEF6E4] flex items-center justify-center text-[#D98218]">
                <Users className="w-4 h-4 text-[#D98218]" />
              </div>
              <div>
                <strong className="text-[12.5px] font-bold text-[#111827] block">Community</strong>
                <span className="text-[11px] text-[#64748B] leading-tight block mt-0.5">
                  Built for collaboration
                </span>
              </div>
            </div>
          </div>

          {/* EXPLORE OPEN CANTEEN SECTIONS */}
          <div className="space-y-2">
            <h3 className="text-[12px] font-bold text-[#64748B] uppercase tracking-wide px-1">
              Explore Open Canteen
            </h3>

            {/* Accordion 1: About the project */}
            <div className="bg-white rounded-[20px] border border-neutral-100/90 overflow-hidden shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
              <button
                type="button"
                onClick={() => toggleSection('project')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-neutral-50/70 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#EBFAF0] flex items-center justify-center text-[#16A34A] shrink-0">
                    <Info className="w-4 h-4 text-[#16A34A]" />
                  </div>
                  <span className="text-[13.5px] font-bold text-[#111827]">About the project</span>
                </div>
                {openSections.project ? (
                  <ChevronDown className="w-4 h-4 text-[#64748B]" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-[#64748B]" />
                )}
              </button>

              {openSections.project && (
                <div className="px-4 pb-4 pt-1 border-t border-[#F1F5F9] text-[12px] text-[#334155] space-y-3">
                  <p className="leading-relaxed">
                    Open Canteen is an open-source canteen ordering and management platform built to make everyday food ordering simpler, faster, and more convenient.
                  </p>
                  <p className="leading-relaxed text-[#64748B]">
                    Designed for educational institutions, campuses, workplaces, and independent canteens, Open Canteen brings customers and canteen operators together through a modern digital experience.
                  </p>

                  <div className="p-3 bg-[#F8FAFC] rounded-xl border border-neutral-200/70 space-y-1.5">
                    <strong className="text-[#111827] text-[12px] block font-semibold">For Customers</strong>
                    <ul className="space-y-1 text-[11px] text-[#475569] pl-1">
                      <li>• Simple, responsive mobile food ordering</li>
                      <li>• Dine-in, takeaway, and campus delivery modes</li>
                      <li>• Dietary vegetarian filter and display appearance settings</li>
                      <li>• Live kitchen preparation status and order history</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-[#F8FAFC] rounded-xl border border-neutral-200/70 space-y-1.5">
                    <strong className="text-[#111827] text-[12px] block font-semibold">For Operators</strong>
                    <ul className="space-y-1 text-[11px] text-[#475569] pl-1">
                      <li>• Modular food catalog and pricing control</li>
                      <li>• Order token dispatch and management</li>
                      <li>• Brand identity customization (name, logo, colors)</li>
                      <li>• Self-hostable, independent deployment</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 2: Development and contributions */}
            <div className="bg-white rounded-[20px] border border-neutral-100/90 overflow-hidden shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
              <button
                type="button"
                onClick={() => toggleSection('contribute')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-neutral-50/70 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#EBF5FF] flex items-center justify-center text-[#0679FC] shrink-0">
                    <GitBranch className="w-4 h-4 text-[#0679FC]" />
                  </div>
                  <span className="text-[13.5px] font-bold text-[#111827]">Development and contributions</span>
                </div>
                {openSections.contribute ? (
                  <ChevronDown className="w-4 h-4 text-[#64748B]" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-[#64748B]" />
                )}
              </button>

              {openSections.contribute && (
                <div className="px-4 pb-4 pt-1 border-t border-[#F1F5F9] text-[12px] text-[#334155] space-y-2.5">
                  <p className="leading-relaxed">
                    Open Canteen is built on the philosophy that useful software should be accessible, transparent, and adaptable under permissive open-source licenses.
                  </p>
                  <p className="text-[#64748B] leading-relaxed text-[11.5px]">
                    Whether you are a student, developer, canteen operator, or designer, your feedback and code contributions help shape Open Canteen.
                  </p>
                  <div className="p-2.5 bg-[#F8FAFC] border border-neutral-200/70 rounded-xl text-[11px] text-[#475569]">
                    <strong className="text-[#111827] block mb-0.5">Public Source Repository</strong>
                    Code and documentation will be published to the official project repository upon public release.
                  </div>
                </div>
              )}
            </div>

            {/* Link 3: Account & Privacy */}
            <button
              type="button"
              onClick={() => navigate('/privacy')}
              className="w-full bg-white hover:bg-neutral-50/80 rounded-[20px] p-4 border border-neutral-100/90 shadow-[0_2px_10px_rgba(15,23,42,0.03)] flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EBFAF0] flex items-center justify-center text-[#16A34A] shrink-0">
                  <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                </div>
                <div>
                  <span className="text-[13.5px] font-bold text-[#111827] block">Account &amp; Privacy</span>
                  <span className="text-[11px] text-[#64748B] block mt-0.5">
                    Your information. Your choices. Clear explanations.
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
            </button>

            {/* Link 4: License and acknowledgements */}
            <button
              type="button"
              onClick={() => navigate('/profile/legal/open-source')}
              className="w-full bg-white hover:bg-neutral-50/80 rounded-[20px] p-4 border border-neutral-100/90 shadow-[0_2px_10px_rgba(15,23,42,0.03)] flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#F3E8FF] flex items-center justify-center text-[#9333EA] shrink-0">
                  <Code2 className="w-4 h-4 text-[#9333EA]" />
                </div>
                <div>
                  <span className="text-[13.5px] font-bold text-[#111827] block">License and acknowledgements</span>
                  <span className="text-[11px] text-[#64748B] block mt-0.5">
                    Open-source software &amp; library notices
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
            </button>
          </div>

          {/* FOOTER */}
          <div className="pt-4 text-center space-y-1">
            <p className="text-[11px] text-[#64748B]">
              Open Canteen • Version 1.0 (Customer PWA)
            </p>
            <p className="text-[10px] text-[#94A3B8] italic">
              Made with care for better everyday food experiences.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};
