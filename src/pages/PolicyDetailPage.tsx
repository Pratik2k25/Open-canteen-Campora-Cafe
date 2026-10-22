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

  if (!policy) {
    return (
      <div className="min-h-screen bg-[#F5F8FB] text-[#111827] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex items-center justify-center text-[#64748B] mb-3">
          <FileText className="w-6 h-6" />
        </div>
        <h2 className="text-[17px] font-bold text-[#111827]">Policy Not Found</h2>
        <p className="text-[12px] text-[#64748B] mt-1 max-w-xs leading-relaxed">
          The requested legal policy document is not recognized or has been moved.
        </p>
        <button
          type="button"
          onClick={() => navigate('/profile/legal')}
          className="mt-4 px-4 py-2 bg-[#111827] hover:bg-neutral-800 text-white text-[12px] font-bold rounded-xl transition-colors cursor-pointer"
        >
          Back to Legal &amp; Policies
        </button>
      </div>
    );
  }

  const iconDetails = getPolicyIconDetails(policy.iconName);

  return (
    <div className="min-h-screen bg-[#F5F8FB] text-[#111827] flex flex-col items-center">
      <div className="w-full max-w-[440px] min-h-screen flex flex-col relative bg-[#F5F8FB] pb-16">
        {/* STICKY TOP HEADER */}
        <header className="sticky top-0 z-30 px-4 py-3 bg-white/95 backdrop-blur-md border-b border-neutral-100 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/profile/legal'))}
              aria-label="Go back"
              className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 border border-neutral-200/80 flex items-center justify-center text-[#111827] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <h1 className="text-[15px] font-bold text-[#111827] tracking-tight leading-none truncate max-w-[240px]">
                {policy.title}
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
          {/* BREADCRUMB & METADATA CARD */}
          <div className="bg-white rounded-[20px] p-4 sm:p-5 border border-neutral-100/90 shadow-[0_2px_10px_rgba(15,23,42,0.03)] space-y-3">
            <div className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
              <button
                type="button"
                onClick={() => navigate('/profile/legal')}
                className="hover:text-emerald-700 hover:underline cursor-pointer"
              >
                Legal &amp; Policies
              </button>
              <span>/</span>
              <span className="text-[#111827] font-medium">{policy.shortTitle}</span>
            </div>

            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl ${iconDetails.bg} border flex items-center justify-center shrink-0 shadow-xs`}>
                {iconDetails.icon}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-[17px] font-bold text-[#111827] tracking-tight">
                  {policy.title}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10.5px]">
                  <span className="px-2 py-0.5 rounded-full bg-neutral-100 border border-neutral-200/80 text-[#334155] flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#64748B]" />
                    Effective {policy.effectiveDate}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-neutral-100 border border-neutral-200/80 text-[#334155]">
                    {policy.version}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-1 font-medium">
                    <Building2 className="w-3 h-3 text-emerald-600" />
                    {canteenName}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#F8FAFC] border border-neutral-100 rounded-xl text-[12px] text-[#334155] leading-relaxed">
              <strong className="text-[#111827] block font-semibold mb-0.5">Policy Summary</strong>
              {policy.summary}
            </div>
          </div>

          {/* POLICY CONTENT SECTIONS */}
          <div className="space-y-3">
            {policy.sections.map((section) => (
              <div
                key={section.id}
                className="bg-white rounded-[20px] p-4 sm:p-5 border border-neutral-100/90 shadow-[0_2px_10px_rgba(15,23,42,0.03)] space-y-2.5"
              >
                <h3 className="text-[13.5px] font-bold text-[#111827] leading-snug">
                  {section.heading}
                </h3>
                <p className="text-[12.5px] text-[#334155] leading-relaxed whitespace-pre-line">
                  {section.content}
                </p>

                {section.bullets && section.bullets.length > 0 && (
                  <ul className="space-y-1.5 pt-1 text-[12px] text-[#334155] pl-1">
                    {section.bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {section.note && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-[#F8FAFC] border border-neutral-100 text-[11px] text-[#64748B] leading-snug">
                    {section.note}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CONTACT & BACK NAVIGATION */}
          <div className="bg-white rounded-[20px] p-4 sm:p-5 border border-neutral-100/90 shadow-[0_2px_10px_rgba(15,23,42,0.03)] space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-600" />
              <h4 className="text-[13px] font-bold text-[#111827]">Need Assistance or Clarification?</h4>
            </div>
            <p className="text-[12px] text-[#64748B] leading-snug">
              For policy questions, contact <strong className="text-[#111827] font-semibold">{canteenName}</strong> at{' '}
              <a href={`mailto:${supportEmail}`} className="text-emerald-600 font-medium hover:underline">
                {supportEmail}
              </a>
              .
            </p>

            <button
              type="button"
              onClick={() => navigate('/profile/legal')}
              className="w-full py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-200/80 text-[#111827] text-[12px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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
