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

  const getPolicyIconDetails = (iconName: LegalPolicyDocument['iconName']) => {
    switch (iconName) {
      case 'ShieldCheck':
        return {
          icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
          bg: 'bg-[#EBFAF0] border-emerald-100/80',
        };
      case 'FileText':
        return {
          icon: <FileText className="w-5 h-5 text-blue-600" />,
          bg: 'bg-[#EBF5FF] border-blue-100/80',
        };
      case 'RotateCcw':
        return {
          icon: <RotateCcw className="w-5 h-5 text-amber-600" />,
          bg: 'bg-[#FEF6E4] border-amber-100/80',
        };
      case 'Truck':
        return {
          icon: <Truck className="w-5 h-5 text-teal-600" />,
          bg: 'bg-[#E6FFFA] border-teal-100/80',
        };
      case 'Code':
        return {
          icon: <Code className="w-5 h-5 text-purple-600" />,
          bg: 'bg-[#F3E8FF] border-purple-100/80',
        };
      default:
        return {
          icon: <FileText className="w-5 h-5 text-neutral-600" />,
          bg: 'bg-neutral-100 border-neutral-200/80',
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F8FB] text-[#111827] flex flex-col items-center">
      <div className="w-full max-w-[440px] min-h-screen flex flex-col relative bg-[#F5F8FB] pb-16">
        {/* STICKY HEADER */}
        <header className="sticky top-0 z-30 px-4 py-3 bg-white/95 backdrop-blur-md border-b border-neutral-100 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/profile'))}
              aria-label="Go back"
              className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 border border-neutral-200/80 flex items-center justify-center text-[#111827] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <h1 className="text-[15px] font-bold text-[#111827] tracking-tight leading-none">
                Legal &amp; Policies
              </h1>
              <p className="text-[11px] text-[#64748B] mt-0.5 truncate">
                {canteenName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <OpenCanteenBrandMark variant="icon" theme="light" className="h-5 w-auto" />
          </div>
        </header>

        {/* MAIN BODY */}
        <main className="flex-1 p-3.5 sm:p-4 space-y-3.5">
          {/* INTRODUCTORY CARD */}
          <div className="bg-white rounded-[20px] p-4 sm:p-5 border border-neutral-100/90 shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-1.5 h-4 bg-emerald-500 rounded-full" />
              <h2 className="text-[14px] font-bold text-[#111827]">Transparency Matters</h2>
            </div>
            <p className="text-[12.5px] text-[#334155] leading-relaxed">
              Here you can find important information about using this canteen's ordering services, how your information is handled, and the policies that apply to your food orders.
            </p>
            <p className="text-[11px] text-[#64748B] mt-2">
              These policies are provided and maintained by the operator of <strong className="text-[#111827] font-semibold">{canteenName}</strong>.
            </p>
          </div>

          {/* POLICY LIST CARDS */}
          <div className="space-y-2.5">
            {policies.map((policy) => {
              const iconDetails = getPolicyIconDetails(policy.iconName);
              return (
                <button
                  key={policy.id}
                  type="button"
                  onClick={() => navigate(`/profile/legal/${policy.id}`)}
                  className="w-full bg-white hover:bg-neutral-50/90 rounded-[20px] p-4 border border-neutral-100/90 hover:border-neutral-200 shadow-[0_2px_10px_rgba(15,23,42,0.03)] text-left transition-all cursor-pointer flex items-start gap-3.5 group"
                >
                  <div className={`w-10 h-10 rounded-xl ${iconDetails.bg} border flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform`}>
                    {iconDetails.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-[13.5px] font-bold text-[#111827] group-hover:text-emerald-700 transition-colors">
                        {policy.title}
                      </h3>
                      <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-[#111827] transition-colors shrink-0" />
                    </div>
                    <p className="text-[11.5px] text-[#64748B] mt-1 line-clamp-2 leading-relaxed">
                      {policy.summary}
                    </p>
                    <div className="flex items-center gap-2 text-[10.5px] text-[#64748B] mt-2 pt-2 border-t border-neutral-100">
                      <span>Effective: {policy.effectiveDate}</span>
                      <span>•</span>
                      <span>{policy.version}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* SECTION F: QUESTIONS ABOUT OUR POLICIES */}
          <div className="bg-white rounded-[20px] p-4 sm:p-5 border border-neutral-100/90 shadow-[0_2px_10px_rgba(15,23,42,0.03)] space-y-2.5">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <h3 className="text-[13px] font-bold text-[#111827]">Questions About Our Policies?</h3>
            </div>
            <p className="text-[12px] text-[#64748B] leading-snug">
              If you have questions about any of these policies or need help with a food order, please contact the canteen operator:
            </p>

            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-neutral-100 text-[11.5px] space-y-1.5 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-[#64748B]">Canteen:</span>
                <span className="text-[#111827] font-semibold">{canteenName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#64748B]">Support Contact:</span>
                <a
                  href={`mailto:${supportEmail}`}
                  className="text-emerald-600 font-medium hover:underline"
                >
                  {supportEmail}
                </a>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#64748B]">Last Policy Review:</span>
                <span className="text-[#334155]">October 2026</span>
              </div>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => navigate('/profile?sheet=helpSupport')}
                className="w-full py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-200/80 text-[#111827] text-[12px] font-semibold transition-colors cursor-pointer"
              >
                Open Help &amp; Support Desk
              </button>
            </div>
          </div>

          {/* FOOTER */}
          <div className="pt-2 text-center text-[10.5px] text-[#64748B]">
            Powered by <strong className="text-[#334155] font-semibold">Open Canteen</strong> • Central Legal Policies System
          </div>
        </main>
      </div>
    </div>
  );
};
