import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { AccountPrivacyView } from '../components/AccountPrivacyView.tsx';
import { OpenCanteenBrandMark } from '../components/OpenCanteenBrandMark.tsx';
import { useCanteen } from '../context/CanteenContext.tsx';

export const AccountPrivacyPage: React.FC = () => {
  const navigate = useNavigate();
  const { config } = useCanteen();

  return (
    <div className="min-h-screen bg-[#F5F8FB] text-[#111827] flex flex-col items-center">
      <div className="w-full max-w-[430px] min-h-screen flex flex-col relative shadow-sm bg-[#F5F8FB]">
        {/* Top Header */}
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
                Account &amp; Privacy
              </h1>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                {config.identity.displayName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <OpenCanteenBrandMark variant="icon" theme="light" className="h-5 w-auto" />
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 p-3.5 sm:p-4">
          <AccountPrivacyView isSheet={false} />
        </main>
      </div>
    </div>
  );
};
