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
    <div className="min-h-screen bg-[#070A0F] text-neutral-100 flex flex-col items-center">
      <div className="w-full max-w-[440px] min-h-screen flex flex-col relative shadow-2xl bg-[#070A0F]">
        {/* Top Header */}
        <header className="sticky top-0 z-30 px-4 py-3 bg-[#0B0F17]/95 backdrop-blur-md border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-700/80 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-[15px] font-bold text-white tracking-tight leading-none">
                Account &amp; Privacy
              </h1>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                {config.identity.displayName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <OpenCanteenBrandMark variant="icon" theme="contrast" className="h-5 w-5" />
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
