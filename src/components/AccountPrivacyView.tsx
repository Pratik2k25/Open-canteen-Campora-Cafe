import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  User,
  Database,
  Layers,
  Sliders,
  ChevronRight,
  ChevronDown,
  Lock,
  Clock,
  Mail,
  FileText,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Trash2,
  Settings,
  HelpCircle,
  Users,
  Smartphone,
  Server,
  Globe,
  CreditCard,
  Bell,
  Eye,
} from 'lucide-react';
import { useCanteen } from '../context/CanteenContext.tsx';
import { getOperatorStorageKey } from '../utils/storageKeys.ts';
import { getLegalPolicyById } from '../config/legalPolicies.ts';

export interface AccountPrivacyViewProps {
  onNavigateSheet?: (sheet: 'editProfile' | 'addressBook' | 'appearance' | 'notifications') => void;
  onClose?: () => void;
  isSheet?: boolean;
}

export const AccountPrivacyView: React.FC<AccountPrivacyViewProps> = ({
  onNavigateSheet,
  onClose,
  isSheet = false,
}) => {
  const { config } = useCanteen();
  const navigate = useNavigate();

  // Accordion expansion state - default to open first or user choice
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    accountData: true,
    techServices: false,
    rightsRequests: false,
  });

  const [activeGlance, setActiveGlance] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleGlanceClick = (sectionKey: string, glanceId: string) => {
    setActiveGlance(glanceId);
    setOpenSections((prev) => ({
      ...prev,
      [sectionKey]: true,
    }));

    // Auto-scroll to target element if present
    setTimeout(() => {
      const el = document.getElementById(`privacy-${glanceId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  const handleActionClick = (target: 'editProfile' | 'addressBook' | 'appearance' | 'notifications') => {
    if (onNavigateSheet) {
      onNavigateSheet(target);
    } else {
      navigate(`/profile?sheet=${target}`);
    }
  };

  const handleClearLocalCache = () => {
    try {
      const operatorId = config.identity.id;
      // Clear operator-scoped cart and UI temporary state safely without destroying auth
      const cartKey = getOperatorStorageKey('cart_v1', operatorId);
      const guestKey = getOperatorStorageKey('guest_info', operatorId);
      localStorage.removeItem(cartKey);
      localStorage.removeItem(guestKey);
      sessionStorage.clear();
      setShowClearConfirm(false);
      setToastMessage('Local application cache cleared safely.');
      setTimeout(() => setToastMessage(null), 3000);
    } catch {
      setToastMessage('Notice: Device storage was already clear.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const canteenName = config.identity.displayName || 'Open Canteen';
  const privacyPolicy = getLegalPolicyById('privacy-policy', config);
  const operatorName = config.legal?.operatorLegalName || config.identity.displayName || 'Campus Canteen Operator';
  const privacyEmail = config.legal?.privacyContactEmail || config.contact.supportEmail;
  const supportEmail = config.contact.supportEmail;
  const effectiveDate = privacyPolicy?.effectiveDate || config.legal?.policyEffectiveDate || 'Pending operator publication';
  const policyVersion = privacyPolicy?.version || config.legal?.policyVersion || 'v1.0 (Draft / Operator Review Pending)';
  const operatingHours = config.contact.operatingHours || 'Available during canteen service hours';

  return (
    <div
      className={`text-neutral-100 flex flex-col ${
        isSheet ? 'pb-6' : 'min-h-full pb-16'
      }`}
    >
      {/* 1. HERO HEADER (Matching Proposed Dark Mobile Layout) */}
      <div className="bg-[#0B0F17] rounded-2xl p-4 sm:p-5 border border-neutral-800 shadow-xl relative overflow-hidden">
        {/* Subtle decorative brand glow */}
        <div
          className="absolute -right-12 -top-12 w-44 h-44 rounded-full opacity-15 blur-2xl pointer-events-none"
          style={{ backgroundColor: config.branding.primaryColor || '#166534' }}
        />

        <div className="flex items-start gap-3.5 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-700/80 flex items-center justify-center shrink-0 text-emerald-400 shadow-inner">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-[17px] font-bold text-white tracking-tight flex items-center gap-2">
              Account &amp; Privacy
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                Official
              </span>
            </h2>
            <p className="text-[12px] text-neutral-400 mt-0.5 leading-snug">
              Your information. Your choices. Clear explanations.
            </p>
          </div>
        </div>

        {/* 2. "YOUR PRIVACY AT A GLANCE" 2x2 GRID */}
        <div className="mt-4 pt-3.5 border-t border-neutral-800/80 relative z-10">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-[12px] font-bold text-neutral-300 tracking-wide uppercase">
              Your privacy at a glance
            </h3>
            <span className="text-[11px] text-neutral-500">Tap to inspect</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Tile 1: Your Information */}
            <button
              type="button"
              onClick={() => handleGlanceClick('accountData', 'information')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                activeGlance === 'information'
                  ? 'bg-neutral-800 border-emerald-500/80 shadow-xs'
                  : 'bg-neutral-900/90 border-neutral-800 hover:bg-neutral-800/70 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-300">
                  <User className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-[12px] font-bold text-white truncate">
                    Your information
                  </div>
                  <div className="text-[10px] text-neutral-400 truncate">
                    What we collect
                  </div>
                </div>
              </div>
            </button>

            {/* Tile 2: Data & Storage */}
            <button
              type="button"
              onClick={() => handleGlanceClick('techServices', 'storage')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                activeGlance === 'storage'
                  ? 'bg-neutral-800 border-emerald-500/80 shadow-xs'
                  : 'bg-neutral-900/90 border-neutral-800 hover:bg-neutral-800/70 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-300">
                  <Database className="w-4 h-4 text-blue-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-[12px] font-bold text-white truncate">
                    Data &amp; storage
                  </div>
                  <div className="text-[10px] text-neutral-400 truncate">
                    Where it is kept
                  </div>
                </div>
              </div>
            </button>

            {/* Tile 3: Connected Services */}
            <button
              type="button"
              onClick={() => handleGlanceClick('techServices', 'services')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                activeGlance === 'services'
                  ? 'bg-neutral-800 border-emerald-500/80 shadow-xs'
                  : 'bg-neutral-900/90 border-neutral-800 hover:bg-neutral-800/70 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-300">
                  <Layers className="w-4 h-4 text-amber-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-[12px] font-bold text-white truncate">
                    Connected services
                  </div>
                  <div className="text-[10px] text-neutral-400 truncate">
                    Who helps operate the app
                  </div>
                </div>
              </div>
            </button>

            {/* Tile 4: Privacy Controls */}
            <button
              type="button"
              onClick={() => handleGlanceClick('rightsRequests', 'controls')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                activeGlance === 'controls'
                  ? 'bg-neutral-800 border-emerald-500/80 shadow-xs'
                  : 'bg-neutral-900/90 border-neutral-800 hover:bg-neutral-800/70 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-300">
                  <Sliders className="w-4 h-4 text-rose-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-[12px] font-bold text-white truncate">
                    Privacy controls
                  </div>
                  <div className="text-[10px] text-neutral-400 truncate">
                    Manage your choices
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* FEEDBACK TOAST */}
      {toastMessage && (
        <div className="mt-3 p-3 bg-emerald-950/90 border border-emerald-600/50 rounded-xl text-emerald-200 text-[12px] font-medium flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ACCORDION 1: ABOUT YOUR ACCOUNT DATA */}
      <div className="mt-3 bg-[#0B0F17] rounded-2xl border border-neutral-800 overflow-hidden shadow-md">
        <button
          type="button"
          onClick={() => toggleSection('accountData')}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-neutral-900/60 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-4 bg-emerald-500 rounded-full" />
            <span className="text-[14px] font-bold text-white">About your account data</span>
          </div>
          {openSections.accountData ? (
            <ChevronDown className="w-4 h-4 text-neutral-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          )}
        </button>

        {openSections.accountData && (
          <div className="px-4 pb-5 pt-1 border-t border-neutral-800/70 flex flex-col gap-4 text-[12.5px] text-neutral-300">
            {/* 1. Who manages your information? */}
            <div id="privacy-operator" className="bg-neutral-900/80 rounded-xl p-3.5 border border-neutral-800">
              <h4 className="text-[13px] font-bold text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-400" />
                1. Who manages your information?
              </h4>
              <p className="mt-1.5 text-neutral-300 leading-relaxed">
                Your canteen, <strong className="text-white font-bold">{canteenName}</strong>, operates this ordering service using Open Canteen, an open-source canteen management platform.
              </p>
              <p className="mt-1 text-neutral-400 leading-relaxed">
                Your canteen operator is responsible for managing your customer information and selecting the services used to operate this application.
              </p>

              <div className="mt-3 space-y-1.5 pt-2.5 border-t border-neutral-800/80 text-[11.5px]">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Managed by:</span>
                  <span className="text-white font-semibold">{operatorName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Privacy contact:</span>
                  {privacyEmail ? (
                    <a href={`mailto:${privacyEmail}`} className="text-emerald-400 hover:underline font-medium">
                      {privacyEmail}
                    </a>
                  ) : (
                    <span className="text-neutral-300 font-medium">Contact canteen counter</span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Data hosting region:</span>
                  <span className="text-white font-medium">Local Browser Storage &amp; Edge Delivery</span>
                </div>
              </div>

              <div className="mt-3 p-2.5 rounded-lg bg-neutral-950/70 border border-neutral-800/80 text-[11px] text-neutral-400">
                <strong className="text-white">Open Canteen Architecture:</strong> The application source code is publicly available. <span className="text-neutral-200 font-medium">Your personal account information and private orders are not part of that public source code.</span>
              </div>
            </div>

            {/* 2. What information is associated with your account? */}
            <div id="privacy-information" className="space-y-2">
              <h4 className="text-[13px] font-bold text-white flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-400" />
                2. What information is associated with your account?
              </h4>
              <p className="text-neutral-400 text-[12px]">
                We use information that helps you access the service, place orders, receive food, and manage your preferences:
              </p>

              <ul className="space-y-2 pl-1">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <div>
                    <strong className="text-white font-semibold">Personal and contact information:</strong>
                    <span className="text-neutral-300"> Name, mobile number, email address when provided, account identifier, and saved profile info.</span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <div>
                    <strong className="text-white font-semibold">Orders and transactions:</strong>
                    <span className="text-neutral-300"> Items ordered, quantities, prices, order totals, numbers, statuses, service mode (Dine-in, Takeaway, Delivery), and payment references.</span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <div>
                    <strong className="text-white font-semibold">Addresses and delivery instructions:</strong>
                    <span className="text-neutral-300"> Saved campus addresses (hostel room, building, department), table numbers, and pickup notes.</span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <div>
                    <strong className="text-white font-semibold">Your preferences:</strong>
                    <span className="text-neutral-300"> Vegetarian food preference, theme appearance (Light, Dark, System), and notification preferences.</span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <div>
                    <strong className="text-white font-semibold">Technical information:</strong>
                    <span className="text-neutral-300"> Browser type, device details, service logs, and network state required for offline PWA reliability and security.</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* 3. Why is your information needed? */}
            <div className="pt-2 border-t border-neutral-800/80 space-y-1.5">
              <h4 className="text-[13px] font-bold text-white flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-blue-400" />
                3. Why is your information needed?
              </h4>
              <p className="text-neutral-300 leading-relaxed text-[12px]">
                Your information is used solely to:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11.5px] text-neutral-300 mt-1">
                <div className="p-2 bg-neutral-900/60 rounded-lg border border-neutral-800">
                  ✓ Prepare, confirm, and fulfill food orders
                </div>
                <div className="p-2 bg-neutral-900/60 rounded-lg border border-neutral-800">
                  ✓ Help staff identify and deliver the correct order
                </div>
                <div className="p-2 bg-neutral-900/60 rounded-lg border border-neutral-800">
                  ✓ Remember your selected dietary preferences
                </div>
                <div className="p-2 bg-neutral-900/60 rounded-lg border border-neutral-800">
                  ✓ Provide live order status alerts and customer support
                </div>
                <div className="p-2 bg-neutral-900/60 rounded-lg border border-neutral-800">
                  ✓ Maintain service reliability and prevent fraud
                </div>
                <div className="p-2 bg-neutral-900/60 rounded-lg border border-neutral-800">
                  ✓ Maintain transaction records where required by law
                </div>
              </div>
            </div>

            {/* 6. Who can access your information? */}
            <div className="pt-2 border-t border-neutral-800/80 space-y-1.5">
              <h4 className="text-[13px] font-bold text-white flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-amber-400" />
                6. Who can access your information?
              </h4>
              <p className="text-neutral-400 text-[12px] leading-relaxed">
                Access to customer records is strictly restricted to:
              </p>
              <ul className="space-y-1 text-[11.5px] pl-1 text-neutral-300">
                <li>• <strong className="text-white">You:</strong> Your own account details, order history, and saved addresses.</li>
                <li>• <strong className="text-white">Authorized canteen personnel:</strong> Information necessary to prepare food, dispatch orders, and resolve customer support questions.</li>
                <li>• <strong className="text-white">Technology providers:</strong> Infrastructure services configured to supply the application (hosting, local caching).</li>
                <li>• <strong className="text-white">Legal authorities:</strong> Information required under applicable lawful process.</li>
              </ul>
              <p className="text-[11px] text-neutral-400 italic">
                Your private account and transaction records are never sold, rented, or exposed as public application data.
              </p>
            </div>

            {/* 7. How is your information protected? & 9. Retention & 10. Younger users */}
            <div className="pt-2 border-t border-neutral-800/80 space-y-2">
              <h4 className="text-[13px] font-bold text-white flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-emerald-400" />
                7. How is your information protected?
              </h4>
              <p className="text-neutral-300 text-[12px] leading-relaxed">
                The application uses operator-partitioned local storage keys, secure HTTPS communications, and strictly scoped access permissions. Open Canteen allows full code inspectability, but operational security is maintained by your canteen operator.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                <div className="p-2.5 bg-neutral-900/70 rounded-xl border border-neutral-800 text-[11.5px]">
                  <strong className="text-white block mb-0.5">9. Data Retention</strong>
                  <span className="text-neutral-400">
                    Order records and receipts are retained according to the canteen's published policy and local tax regulations. You can clear local session storage anytime.
                  </span>
                </div>
                <div className="p-2.5 bg-neutral-900/70 rounded-xl border border-neutral-800 text-[11.5px]">
                  <strong className="text-white block mb-0.5">10. Younger Users</strong>
                  <span className="text-neutral-400">
                    If you are under 18, parental or guardian consent may be required under applicable laws for payment transactions and account registration.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ACCORDION 2: TECHNOLOGY & THIRD-PARTY SERVICES */}
      <div className="mt-3 bg-[#0B0F17] rounded-2xl border border-neutral-800 overflow-hidden shadow-md">
        <button
          type="button"
          onClick={() => toggleSection('techServices')}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-neutral-900/60 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-4 bg-blue-500 rounded-full" />
            <span className="text-[14px] font-bold text-white">Technology &amp; third-party services</span>
          </div>
          {openSections.techServices ? (
            <ChevronDown className="w-4 h-4 text-neutral-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          )}
        </button>

        {openSections.techServices && (
          <div className="px-4 pb-5 pt-1 border-t border-neutral-800/70 flex flex-col gap-4 text-[12.5px] text-neutral-300">
            {/* 4. Where is your information stored? */}
            <div id="privacy-storage" className="space-y-2">
              <h4 className="text-[13px] font-bold text-white flex items-center gap-1.5">
                <Database className="w-4 h-4 text-blue-400" />
                4. Where is your information stored?
              </h4>
              <p className="text-neutral-400 text-[12px]">
                Depending on the configured deployment mode, information is stored across three layers:
              </p>

              <div className="space-y-2">
                <div className="p-3 bg-neutral-900/80 rounded-xl border border-neutral-800">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span className="text-white font-bold text-[12.5px]">On your device</span>
                  </div>
                  <p className="text-neutral-300 text-[11.5px] mt-1 leading-relaxed">
                    Your active cart, recent order token, vegetarian food toggle, and appearance preferences are stored directly in your browser's local storage under the isolated namespace <code className="px-1.5 py-0.5 bg-neutral-950 rounded text-emerald-300 text-[10.5px]">opencanteen:{config.identity.id}:*</code>.
                  </p>
                  <p className="text-neutral-400 text-[11px] mt-1">
                    Clearing browser storage removes device-side information.
                  </p>
                </div>

                <div className="p-3 bg-neutral-900/80 rounded-xl border border-neutral-800">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-blue-400" />
                    <span className="text-white font-bold text-[12.5px]">In your canteen's database</span>
                  </div>
                  <p className="text-neutral-300 text-[11.5px] mt-1 leading-relaxed">
                    When cloud synchronization or online canteen order dispatch is enabled by your operator, customer profiles, order tokens, and campus delivery addresses are stored in the operator's dedicated cloud database.
                  </p>
                </div>

                <div className="p-3 bg-neutral-900/80 rounded-xl border border-neutral-800">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-amber-400" />
                    <span className="text-white font-bold text-[12.5px]">In external storage systems</span>
                  </div>
                  <p className="text-neutral-300 text-[11.5px] mt-1 leading-relaxed">
                    Menu photography, brand icons, and food catalog images are cached via the web application's service worker and media edge CDN.
                  </p>
                </div>
              </div>
            </div>

            {/* 5. Technology and third-party services */}
            <div id="privacy-services" className="pt-2 border-t border-neutral-800/80 space-y-2.5">
              <h4 className="text-[13px] font-bold text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-400" />
                5. Technology &amp; third-party service disclosures
              </h4>
              <p className="text-neutral-400 text-[12px]">
                Open Canteen supports modular deployment integrations. The following technologies may be used when the corresponding features are enabled:
              </p>

              {/* Service Disclosures Table / Grid */}
              <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950/70">
                <table className="w-full text-left text-[11.5px]">
                  <thead className="bg-neutral-900 border-b border-neutral-800 text-neutral-300 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Service / Provider</th>
                      <th className="py-2.5 px-3">Purpose in Open Canteen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/80 text-neutral-300">
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-white flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        Firebase Authentication
                      </td>
                      <td className="py-2.5 px-3 text-neutral-400">
                        Customer sign-in and session security (Configured)
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-white flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        Google Cloud Firestore
                      </td>
                      <td className="py-2.5 px-3 text-neutral-400">
                        Customer profiles and order record synchronization (Configured)
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-white flex items-center gap-1.5">
                        <Server className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        Web Hosting &amp; PWA Cache
                      </td>
                      <td className="py-2.5 px-3 text-neutral-400">
                        PWA delivery, HTTPS security, and Workbox offline caching
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-white flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        Local Application Media
                      </td>
                      <td className="py-2.5 px-3 text-neutral-400">
                        Menu photographs packaged directly with application (No external CDN tracking)
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-white flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        Payment Processing Mode
                      </td>
                      <td className="py-2.5 px-3 text-neutral-400">
                        Cash on Counter &amp; Simulated Demo Tokens (No external merchant gateway active)
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-white flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        Offline &amp; Device Storage
                      </td>
                      <td className="py-2.5 px-3 text-neutral-400">
                        Local browser storage for cart tokens and UI display preferences
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Active Verified Services Box */}
              <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-[12px]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Services active for this canteen:
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-1 rounded-full bg-neutral-900 border border-emerald-700/60 text-emerald-300 text-[11px] font-medium">
                    ✓ Browser Local Storage (Partitioned)
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-neutral-900 border border-emerald-700/60 text-emerald-300 text-[11px] font-medium">
                    ✓ Progressive Web App Offline Engine
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-neutral-900 border border-emerald-700/60 text-emerald-300 text-[11px] font-medium">
                    ✓ Self-Hosted Canteen Order Dispatch
                  </span>
                </div>
                <p className="mt-2 text-[10.5px] text-emerald-400/80">
                  Only verified active providers process information for this deployment.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ACCORDION 3: YOUR PRIVACY RIGHTS & REQUESTS */}
      <div className="mt-3 bg-[#0B0F17] rounded-2xl border border-neutral-800 overflow-hidden shadow-md">
        <button
          type="button"
          onClick={() => toggleSection('rightsRequests')}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-neutral-900/60 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-4 bg-rose-500 rounded-full" />
            <span className="text-[14px] font-bold text-white">Your privacy rights &amp; requests</span>
          </div>
          {openSections.rightsRequests ? (
            <ChevronDown className="w-4 h-4 text-neutral-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          )}
        </button>

        {openSections.rightsRequests && (
          <div className="px-4 pb-5 pt-1 border-t border-neutral-800/70 flex flex-col gap-4 text-[12.5px] text-neutral-300">
            {/* 8. Manage your privacy */}
            <div id="privacy-controls" className="space-y-2">
              <h4 className="text-[13px] font-bold text-white flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-rose-400" />
                8. Manage your privacy
              </h4>
              <p className="text-neutral-400 text-[12px]">
                You have direct control over your personal information and stored preferences:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {/* Action 1: Edit Profile */}
                <button
                  type="button"
                  onClick={() => handleActionClick('editProfile')}
                  className="p-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 flex items-center justify-between text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="text-[12px] font-bold text-white">Edit Personal Information</div>
                      <div className="text-[10.5px] text-neutral-400">Update name, phone, or email</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-500" />
                </button>

                {/* Action 2: Manage Addresses */}
                <button
                  type="button"
                  onClick={() => handleActionClick('addressBook')}
                  className="p-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 flex items-center justify-between text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Database className="w-4 h-4 text-blue-400" />
                    <div>
                      <div className="text-[12px] font-bold text-white">Manage Saved Addresses</div>
                      <div className="text-[10.5px] text-neutral-400">Review or delete hostel rooms</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-500" />
                </button>

                {/* Action 3: Appearance Preferences */}
                <button
                  type="button"
                  onClick={() => handleActionClick('appearance')}
                  className="p-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 flex items-center justify-between text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="text-[12px] font-bold text-white">Theme &amp; Dietary Preferences</div>
                      <div className="text-[10.5px] text-neutral-400">Vegetarian mode, dark theme</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-500" />
                </button>

                {/* Action 4: Clear Device Cache */}
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="p-3 rounded-xl bg-neutral-900 hover:bg-rose-950/40 border border-neutral-800 hover:border-rose-800/60 flex items-center justify-between text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    <div>
                      <div className="text-[12px] font-bold text-rose-300">Clear Local Device Cache</div>
                      <div className="text-[10.5px] text-neutral-400">Reset saved browser storage</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-500" />
                </button>
              </div>

              {/* Data Rights & Deletion Information */}
              <div className="mt-3 p-3 bg-neutral-900/60 rounded-xl border border-neutral-800 text-[11.5px] text-neutral-300 space-y-2">
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-semibold">Request a copy of your information</strong>
                    <span className="text-neutral-400">
                      Contact your canteen operator to request a digital export of personal information and completed order receipts associated with your account.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-2 border-t border-neutral-800/80">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-semibold">Request account or data deletion</strong>
                    <span className="text-neutral-400">
                      You may ask the canteen operator to delete your profile and personal information. Deleting an account will clear saved details, subject to legitimate transaction records required for tax and legal compliance.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 11. Privacy questions and requests */}
            <div className="pt-2 border-t border-neutral-800/80 space-y-2">
              <h4 className="text-[13px] font-bold text-white flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-emerald-400" />
                11. Privacy questions and requests
              </h4>
              <p className="text-neutral-300 text-[12px]">
                Have a question about your account or want to submit a formal privacy inquiry?
              </p>

              <div className="p-3.5 bg-neutral-900 rounded-xl border border-neutral-800 flex flex-col gap-2 text-[12px]">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Canteen:</span>
                  <span className="font-bold text-white">{canteenName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Operator:</span>
                  <span className="font-medium text-neutral-200">{operatorName}</span>
                </div>
                {privacyEmail && (
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Privacy contact:</span>
                    <a
                      href={`mailto:${privacyEmail}`}
                      className="font-bold text-emerald-400 hover:underline"
                    >
                      {privacyEmail}
                    </a>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Support hours:</span>
                  <span className="text-neutral-300 font-medium">{operatingHours}</span>
                </div>
              </div>
            </div>

            {/* 12. Read our complete policies */}
            <div className="pt-2 border-t border-neutral-800/80 space-y-2">
              <h4 className="text-[13px] font-bold text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-400" />
                12. Read our complete policies
              </h4>
              <p className="text-neutral-400 text-[11.5px] leading-relaxed">
                This page is a clear, convenient explanation of account privacy. For complete details regarding personal data processing, retention, provider contracts, and dispute resolution, please review the complete policies:
              </p>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/profile/legal/privacy-policy')}
                  className="flex-1 p-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-left transition-colors cursor-pointer"
                >
                  <strong className="text-white block font-medium hover:text-emerald-400">Privacy Policy →</strong>
                  <span className="text-neutral-400 text-[10.5px]">Complete data protection notice</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/profile/legal/terms-of-service')}
                  className="flex-1 p-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-left transition-colors cursor-pointer"
                >
                  <strong className="text-white block font-medium hover:text-emerald-400">Terms of Service →</strong>
                  <span className="text-neutral-400 text-[10.5px]">Conditions for campus ordering</span>
                </button>
              </div>

              <div className="flex justify-between items-center text-[10.5px] text-neutral-500 pt-1">
                <span>Last updated: {effectiveDate}</span>
                <span>Privacy notice: {policyVersion}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CONFIRMATION MODAL FOR CLEAR CACHE */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-neutral-700 rounded-2xl p-5 max-w-sm w-full shadow-2xl">
            <h3 className="text-[15px] font-bold text-white flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-400" />
              Clear Local Cache?
            </h3>
            <p className="text-[12px] text-neutral-300 mt-2 leading-relaxed">
              This will remove cached cart items and temporary UI state from this browser. Your registered profile and completed orders remain safe.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[12px] font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearLocalCache}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[12px] font-bold cursor-pointer shadow-xs"
              >
                Clear Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER ATTRIBUTION */}
      <div className="mt-5 text-center text-[11px] text-neutral-400">
        <p className="italic">
          Powered by <strong className="text-neutral-300 font-semibold">Open Canteen</strong> — Open-source canteen ordering and management software.
        </p>
        <p className="text-[10px] text-neutral-500 mt-0.5">
          Suggested mobile-first layout, using each canteen's configured branding and actual service disclosures.
        </p>
      </div>

      {isSheet && onClose && (
        <div className="mt-4 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-[13px] font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
};
