import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  FileText,
  RotateCcw,
  Truck,
  Code,
  Calendar,
  Building2,
  Mail,
  ChevronLeft,
} from 'lucide-react';
import { useCanteen } from '../context/CanteenContext.tsx';
import { getLegalPolicyById, type LegalPolicyDocument } from '../config/legalPolicies.ts';
import { OpenCanteenBrandMark } from '../components/OpenCanteenBrandMark.tsx';

export const PolicyDetailPage: React.FC = () => {
  const { policyId } = useParams<{ policyId: string }>();
  const navigate = useNavigate();
  const { config } = useCanteen();

  const policy = policyId ? getLegalPolicyById(policyId, config) : undefined;
  const canteenName = config.identity.displayName || 'Open Canteen';
  const supportEmail = config.contact.supportEmail || 'privacy@opencanteen.org';

  const renderPolicyIcon = (iconName: LegalPolicyDocument['iconName']) => {
    switch (iconName) {
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case 'FileText':
        return <FileText className="w-5 h-5 text-blue-400" />;
      case 'RotateCcw':
        return <RotateCcw className="w-5 h-5 text-amber-400" />;
      case 'Truck':
        return <Truck className="w-5 h-5 text-teal-400" />;
      case 'Code':
        return <Code className="w-5 h-5 text-purple-400" />;
      default:
        return <FileText className="w-5 h-5 text-neutral-400" />;
    }
  };

  if (!policy) {
    return (
      <div className="min-h-screen bg-[#070A0F] text-neutral-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 mb-3">
          <FileText className="w-6 h-6" />
        </div>
        <h2 className="text-[17px] font-bold text-white">Policy Not Found</h2>
        <p className="text-[12px] text-neutral-400 mt-1 max-w-xs leading-relaxed">
          The requested legal policy document is not recognized or has been moved.
        </p>
        <button
          type="button"
          onClick={() => navigate('/profile/legal')}
          className="mt-4 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-[12px] font-bold rounded-xl transition-colors cursor-pointer"
        >
          Back to Legal &amp; Policies
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070A0F] text-neutral-100 flex flex-col items-center">
      <div className="w-full max-w-[440px] min-h-screen flex flex-col relative shadow-2xl bg-[#070A0F] pb-16">
        {/* STICKY TOP HEADER */}
        <header className="sticky top-0 z-30 px-4 py-3 bg-[#0B0F17]/95 backdrop-blur-md border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/profile/legal'))}
              aria-label="Go back"
              className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-700/80 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <h1 className="text-[15px] font-bold text-white tracking-tight leading-none truncate max-w-[240px]">
                {policy.title}
              </h1>
              <p className="text-[11px] text-neutral-400 mt-0.5 truncate">
                {canteenName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <OpenCanteenBrandMark variant="icon" theme="contrast" className="h-5 w-auto" />
          </div>
        </header>

        {/* MAIN BODY */}
        <main className="flex-1 p-3.5 sm:p-4 space-y-3.5">
          {/* BREADCRUMB & METADATA CARD */}
          <div className="bg-[#0B0F17] rounded-2xl p-4 sm:p-5 border border-neutral-800 shadow-md space-y-3">
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
              <button
                type="button"
                onClick={() => navigate('/profile/legal')}
                className="hover:text-emerald-400 hover:underline cursor-pointer"
              >
                Legal &amp; Policies
              </button>
              <span>/</span>
              <span className="text-white font-medium">{policy.shortTitle}</span>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-700/80 flex items-center justify-center shrink-0 shadow-inner">
                {renderPolicyIcon(policy.iconName)}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-[17px] font-bold text-white tracking-tight">
                  {policy.title}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10.5px]">
                  <span className="px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-300 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-neutral-400" />
                    Effective {policy.effectiveDate}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-300">
                    {policy.version}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-emerald-400" />
                    {canteenName}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-neutral-900/70 border border-neutral-800 rounded-xl text-[12px] text-neutral-300 leading-relaxed">
              <strong className="text-white block font-semibold mb-0.5">Policy Summary</strong>
              {policy.summary}
            </div>
          </div>

          {/* POLICY CONTENT SECTIONS */}
          <div className="space-y-3">
            {policy.sections.map((section) => (
              <div
                key={section.id}
                className="bg-[#0B0F17] rounded-2xl p-4 sm:p-5 border border-neutral-800 shadow-sm space-y-2.5"
              >
                <h3 className="text-[13.5px] font-bold text-white leading-snug">
                  {section.heading}
                </h3>
                <p className="text-[12.5px] text-neutral-300 leading-relaxed whitespace-pre-line">
                  {section.content}
                </p>

                {section.bullets && section.bullets.length > 0 && (
                  <ul className="space-y-1.5 pt-1 text-[12px] text-neutral-300 pl-1">
                    {section.bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {section.note && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800 text-[11px] text-neutral-400 leading-snug">
                    {section.note}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CONTACT & BACK NAVIGATION */}
          <div className="bg-[#0B0F17] rounded-2xl p-4 sm:p-5 border border-neutral-800 shadow-md space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400" />
              <h4 className="text-[13px] font-bold text-white">Need Assistance or Clarification?</h4>
            </div>
            <p className="text-[12px] text-neutral-400 leading-snug">
              For policy questions, contact <strong className="text-neutral-200">{canteenName}</strong> at{' '}
              <a href={`mailto:${supportEmail}`} className="text-emerald-400 hover:underline">
                {supportEmail}
              </a>
              .
            </p>

            <button
              type="button"
              onClick={() => navigate('/profile/legal')}
              className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-[12px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to All Policies</span>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};
