import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  FileText,
  RotateCcw,
  Truck,
  Code,
  ChevronRight,
  HelpCircle,
  Mail,
  Info,
} from 'lucide-react';
import { useCanteen } from '../context/CanteenContext.tsx';
import { getLegalPolicies, type LegalPolicyDocument } from '../config/legalPolicies.ts';
import { OpenCanteenBrandMark } from '../components/OpenCanteenBrandMark.tsx';

export const LegalPoliciesPage: React.FC = () => {
  const navigate = useNavigate();
  const { config } = useCanteen();
  const policies = getLegalPolicies(config);

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

  return (
    <div className="min-h-screen bg-[#070A0F] text-neutral-100 flex flex-col items-center">
      <div className="w-full max-w-[440px] min-h-screen flex flex-col relative shadow-2xl bg-[#070A0F] pb-16">
        {/* STICKY HEADER */}
        <header className="sticky top-0 z-30 px-4 py-3 bg-[#0B0F17]/95 backdrop-blur-md border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/profile'))}
              aria-label="Go back"
              className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-700/80 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <h1 className="text-[15px] font-bold text-white tracking-tight leading-none">
                Legal &amp; Policies
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
          {/* INTRODUCTORY CARD */}
          <div className="bg-[#0B0F17] rounded-2xl p-4 sm:p-5 border border-neutral-800 shadow-md">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-1.5 h-4 bg-emerald-500 rounded-full" />
              <h2 className="text-[14px] font-bold text-white">Transparency Matters</h2>
            </div>
            <p className="text-[12.5px] text-neutral-300 leading-relaxed">
              Here you can find important information about using this canteen's ordering services, how your information is handled, and the policies that apply to your food orders.
            </p>
            <p className="text-[11px] text-neutral-400 mt-2">
              These policies are provided and maintained by the operator of <strong className="text-neutral-200">{canteenName}</strong>.
            </p>
          </div>

          {/* POLICY LIST CARDS */}
          <div className="space-y-2.5">
            {policies.map((policy) => (
              <button
                key={policy.id}
                type="button"
                onClick={() => navigate(`/profile/legal/${policy.id}`)}
                className="w-full bg-[#0B0F17] hover:bg-neutral-900/90 rounded-2xl p-4 border border-neutral-800 hover:border-neutral-700 shadow-sm text-left transition-all cursor-pointer flex items-start gap-3.5 group"
              >
                <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-700/80 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                  {renderPolicyIcon(policy.iconName)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-[13.5px] font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {policy.title}
                    </h3>
                    <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-neutral-300 transition-colors shrink-0" />
                  </div>
                  <p className="text-[11.5px] text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                    {policy.summary}
                  </p>
                  <div className="flex items-center gap-2 text-[10.5px] text-neutral-500 mt-2 pt-2 border-t border-neutral-800/80">
                    <span>Effective: {policy.effectiveDate}</span>
                    <span>•</span>
                    <span>{policy.version}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* SECTION F: QUESTIONS ABOUT OUR POLICIES */}
          <div className="bg-[#0B0F17] rounded-2xl p-4 sm:p-5 border border-neutral-800 shadow-md space-y-2.5">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <h3 className="text-[13px] font-bold text-white">Questions About Our Policies?</h3>
            </div>
            <p className="text-[12px] text-neutral-400 leading-snug">
              If you have questions about any of these policies or need help with a food order, please contact the canteen operator:
            </p>

            <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 text-[11.5px] space-y-1.5 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Canteen:</span>
                <span className="text-white font-semibold">{canteenName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Support Contact:</span>
                <a
                  href={`mailto:${supportEmail}`}
                  className="text-emerald-400 font-medium hover:underline"
                >
                  {supportEmail}
                </a>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Last Policy Review:</span>
                <span className="text-neutral-300">October 2026</span>
              </div>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => navigate('/profile?sheet=helpSupport')}
                className="w-full py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-[12px] font-semibold transition-colors cursor-pointer"
              >
                Open Help &amp; Support Desk
              </button>
            </div>
          </div>

          {/* FOOTER */}
          <div className="pt-2 text-center text-[10.5px] text-neutral-500">
            Powered by <strong className="text-neutral-400">Open Canteen</strong> • Central Legal Policies System
          </div>
        </main>
      </div>
    </div>
  );
};
