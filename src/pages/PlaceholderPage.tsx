import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { BottomNavigation } from '../components/BottomNavigation.tsx';

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, description }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-neutral-900 pb-28 flex flex-col items-center">
      <div className="w-full max-w-[430px] min-h-screen bg-[#F8F9FA] flex flex-col relative shadow-sm">
        {/* Simple Header */}
        <div className="px-4 py-3 flex items-center gap-3 border-b border-neutral-200/60 bg-white">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-neutral-100 text-neutral-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold text-neutral-900">{title}</h1>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400 mb-3">
            <span className="text-xl font-bold">OC</span>
          </div>
          <h2 className="text-base font-bold text-neutral-800">{title}</h2>
          <p className="text-xs text-neutral-500 mt-1.5 max-w-xs leading-relaxed">
            {description || 'This screen will be implemented once its approved reference design is supplied.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-5 px-4 py-2 bg-[#136B3C] text-white text-xs font-bold rounded-xl shadow-xs"
          >
            Back to Home
          </button>
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation />
      </div>
    </div>
  );
};
