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
      className={`text-[#111827] flex flex-col ${
        isSheet ? 'pb-6' : 'min-h-full pb-16'
      }`}
    >
      {/* 1. HERO HEADER */}
      <div className="bg-white rounded-[20px] p-4 sm:p-5 border border-neutral-100/90 shadow-[0_2px_10px_rgba(15,23,42,0.03)] relative overflow-hidden">
        {/* Subtle decorative brand glow */}
        <div
          className="absolute -right-12 -top-12 w-44 h-44 rounded-full opacity-10 blur-2xl pointer-events-none"
          style={{ backgroundColor: config.branding.primaryColor || '#166534' }}
        />

        <div className="flex items-start gap-3.5 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-[#EBFAF0] border border-[#D1F2DD] flex items-center justify-center shrink-0 text-[#16A34A] shadow-xs">
            <ShieldCheck className="w-5 h-5 text-[#16A34A]" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-[17px] font-bold text-[#111827] tracking-tight flex items-center gap-2">
              Account &amp; Privacy
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-[#EBFAF0] text-[#16A34A] border border-[#D1F2DD]">
                Official
              </span>
            </h2>
            <p className="text-[12px] text-[#64748B] mt-0.5 leading-snug">
              Your information. Your choices. Clear explanations.
            </p>
          </div>
        </div>

        {/* 2. "YOUR PRIVACY AT A GLANCE" 2x2 GRID */}
        <div className="mt-4 pt-3.5 border-t border-[#F1F5F9] relative z-10">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-[12px] font-bold text-[#111827] tracking-wide uppercase">
              Your privacy at a glance
            </h3>
            <span className="text-[11px] text-[#64748B]">Tap to inspect</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Tile 1: Your Information */}
            <button
              type="button"
              onClick={() => handleGlanceClick('accountData', 'information')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                activeGlance === 'information'
                  ? 'bg-[#EBFAF0]/60 border-[#19B559] shadow-xs'
                  : 'bg-[#F8FAFC] border-neutral-200/70 hover:bg-neutral-100/80 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#EBFAF0] flex items-center justify-center text-[#16A34A]">
                  <User className="w-4 h-4 text-[#16A34A]" />
                </div>
                <div className="min-w-0">
                  <div className="text-[12px] font-bold text-[#111827] truncate">
                    Your information
                  </div>
                  <div className="text-[10px] text-[#64748B] truncate">
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
                  ? 'bg-[#EBF5FF]/60 border-[#0679FC] shadow-xs'
                  : 'bg-[#F8FAFC] border-neutral-200/70 hover:bg-neutral-100/80 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#EBF5FF] flex items-center justify-center text-[#0679FC]">
                  <Database className="w-4 h-4 text-[#0679FC]" />
                </div>
                <div className="min-w-0">
                  <div className="text-[12px] font-bold text-[#111827] truncate">
                    Data &amp; storage
                  </div>
                  <div className="text-[10px] text-[#64748B] truncate">
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
                  ? 'bg-[#FEF6E4]/60 border-[#D98218] shadow-xs'
                  : 'bg-[#F8FAFC] border-neutral-200/70 hover:bg-neutral-100/80 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#FEF6E4] flex items-center justify-center text-[#D98218]">
                  <Layers className="w-4 h-4 text-[#D98218]" />
                </div>
                <div className="min-w-0">
                  <div className="text-[12px] font-bold text-[#111827] truncate">
                    Connected services
                  </div>
                  <div className="text-[10px] text-[#64748B] truncate">
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
                  ? 'bg-[#FCEAEA]/60 border-[#EF5350] shadow-xs'
                  : 'bg-[#F8FAFC] border-neutral-200/70 hover:bg-neutral-100/80 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#FCEAEA] flex items-center justify-center text-[#EF5350]">
                  <Sliders className="w-4 h-4 text-[#EF5350]" />
                </div>
                <div className="min-w-0">
                  <div className="text-[12px] font-bold text-[#111827] truncate">
                    Privacy controls
                  </div>
                  <div className="text-[10px] text-[#64748B] truncate">
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
        <div className="mt-3 p-3 bg-[#111827] border border-neutral-800 rounded-xl text-white text-[12px] font-medium flex items-center gap-2 animate-fade-in shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-[#19B559] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ACCORDION 1: ABOUT YOUR ACCOUNT DATA */}
      <div className="mt-3 bg-white rounded-[20px] border border-neutral-100/90 overflow-hidden shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
        <button
          type="button"
          onClick={() => toggleSection('accountData')}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-neutral-50/70 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-4 bg-[#19B559] rounded-full" />
            <span className="text-[14px] font-bold text-[#111827]">About your account data</span>
          </div>
          {openSections.accountData ? (
            <ChevronDown className="w-4 h-4 text-[#64748B]" />
          ) : (
            <ChevronRight className="w-4 h-4 text-[#64748B]" />
          )}
        </button>

        {openSections.accountData && (
          <div className="px-4 pb-5 pt-1 border-t border-[#F1F5F9] flex flex-col gap-4 text-[12.5px] text-[#334155]">
            {/* 1. Who manages your information? */}
            <div id="privacy-operator" className="bg-[#F8FAFC] rounded-xl p-3.5 border border-[#F1F5F9]">
              <h4 className="text-[13px] font-bold text-[#111827] flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#16A34A]" />
                1. Who manages your information?
              </h4>
              <p className="mt-1.5 text-[#334155] leading-relaxed">
                Your canteen, <strong className="text-[#111827] font-bold">{canteenName}</strong>, operates this ordering service using Open Canteen, an open-source canteen management platform.
              </p>
              <p className="mt-1 text-[#64748B] leading-relaxed">
                Your canteen operator is responsible for managing your customer information and selecting the services used to operate this application.
              </p>

              <div className="mt-3 space-y-1.5 pt-2.5 border-t border-neutral-200/80 text-[11.5px]">
                <div className="flex justify-between items-center">
                  <span className="text-[#64748B]">Managed by:</span>
                  <span className="text-[#111827] font-semibold">{operatorName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#64748B]">Privacy contact:</span>
                  {privacyEmail ? (
                    <a href={`mailto:${privacyEmail}`} className="text-[#16A34A] hover:underline font-medium">
                      {privacyEmail}
                    </a>
                  ) : (
                    <span className="text-[#334155] font-medium">Contact canteen counter</span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#64748B]">Data hosting region:</span>
                  <span className="text-[#111827] font-medium">Local Browser Storage &amp; Edge Delivery</span>
                </div>
              </div>

              <div className="mt-3 p-2.5 rounded-lg bg-white border border-neutral-200/80 text-[11px] text-[#475569]">
                <strong className="text-[#111827]">Open Canteen Architecture:</strong> The application source code is publicly available. <span className="text-[#334155] font-medium">Your personal account information and private orders are not part of that public source code.</span>
              </div>
            </div>

            {/* 2. What information is associated with your account? */}
            <div id="privacy-information" className="space-y-2">
              <h4 className="text-[13px] font-bold text-[#111827] flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#16A34A]" />
                2. What information is associated with your account?
              </h4>
              <p className="text-[#64748B] text-[12px]">
                We use information that helps you access the service, place orders, receive food, and manage your preferences:
              </p>

              <ul className="space-y-2 pl-1">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] mt-1.5 shrink-0" />
                  <div>
                    <strong className="text-[#111827] font-semibold">Personal and contact information:</strong>
                    <span className="text-[#475569]"> Name, mobile number, email address when provided, account identifier, and saved profile info.</span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] mt-1.5 shrink-0" />
                  <div>
                    <strong className="text-[#111827] font-semibold">Orders and transactions:</strong>
                    <span className="text-[#475569]"> Items ordered, quantities, prices, order totals, numbers, statuses, service mode (Dine-in, Takeaway, Delivery), and payment references.</span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] mt-1.5 shrink-0" />
                  <div>
                    <strong className="text-[#111827] font-semibold">Addresses and delivery instructions:</strong>
                    <span className="text-[#475569]"> Saved campus addresses (hostel room, building, department), table numbers, and pickup notes.</span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] mt-1.5 shrink-0" />
                  <div>
                    <strong className="text-[#111827] font-semibold">Your preferences:</strong>
                    <span className="text-[#475569]"> Vegetarian food preference, theme appearance (Light, Dark, System), and notification preferences.</span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] mt-1.5 shrink-0" />
                  <div>
                    <strong className="text-[#111827] font-semibold">Technical information:</strong>
                    <span className="text-[#475569]"> Browser type, device details, service logs, and network state required for offline PWA reliability and security.</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* 3. Why is your information needed? */}
            <div className="pt-2 border-t border-[#F1F5F9] space-y-1.5">
              <h4 className="text-[13px] font-bold text-[#111827] flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-[#0679FC]" />
                3. Why is your information needed?
              </h4>
              <p className="text-[#334155] leading-relaxed text-[12px]">
                Your information is used solely to:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11.5px] text-[#334155] mt-1">
                <div className="p-2 bg-[#F8FAFC] rounded-lg border border-neutral-200/70">
                  ✓ Prepare, confirm, and fulfill food orders
                </div>
                <div className="p-2 bg-[#F8FAFC] rounded-lg border border-neutral-200/70">
                  ✓ Help staff identify and deliver the correct order
                </div>
                <div className="p-2 bg-[#F8FAFC] rounded-lg border border-neutral-200/70">
                  ✓ Remember your selected dietary preferences
                </div>
                <div className="p-2 bg-[#F8FAFC] rounded-lg border border-neutral-200/70">
                  ✓ Provide live order status alerts and customer support
                </div>
                <div className="p-2 bg-[#F8FAFC] rounded-lg border border-neutral-200/70">
                  ✓ Maintain service reliability and prevent fraud
                </div>
                <div className="p-2 bg-[#F8FAFC] rounded-lg border border-neutral-200/70">
                  ✓ Maintain transaction records where required by law
                </div>
              </div>
            </div>

            {/* 6. Who can access your information? */}
            <div className="pt-2 border-t border-[#F1F5F9] space-y-1.5">
              <h4 className="text-[13px] font-bold text-[#111827] flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#D98218]" />
                6. Who can access your information?
              </h4>
              <p className="text-[#64748B] text-[12px] leading-relaxed">
                Access to customer records is strictly restricted to:
              </p>
              <ul className="space-y-1 text-[11.5px] pl-1 text-[#475569]">
                <li>• <strong className="text-[#111827]">You:</strong> Your own account details, order history, and saved addresses.</li>
                <li>• <strong className="text-[#111827]">Authorized canteen personnel:</strong> Information necessary to prepare food, dispatch orders, and resolve customer support questions.</li>
                <li>• <strong className="text-[#111827]">Technology providers:</strong> Infrastructure services configured to supply the application (hosting, local caching).</li>
                <li>• <strong className="text-[#111827]">Legal authorities:</strong> Information required under applicable lawful process.</li>
              </ul>
              <p className="text-[11px] text-[#64748B] italic">
                Your private account and transaction records are never sold, rented, or exposed as public application data.
              </p>
            </div>

            {/* 7. How is your information protected? & 9. Retention & 10. Younger users */}
            <div className="pt-2 border-t border-[#F1F5F9] space-y-2">
              <h4 className="text-[13px] font-bold text-[#111827] flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-[#16A34A]" />
                7. How is your information protected?
              </h4>
              <p className="text-[#334155] text-[12px] leading-relaxed">
                The application uses operator-partitioned local storage keys, secure HTTPS communications, and strictly scoped access permissions. Open Canteen allows full code inspectability, but operational security is maintained by your canteen operator.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                <div className="p-2.5 bg-[#F8FAFC] rounded-xl border border-neutral-200/70 text-[11.5px]">
                  <strong className="text-[#111827] block mb-0.5">9. Data Retention</strong>
                  <span className="text-[#64748B]">
                    Order records and receipts are retained according to the canteen's published policy and local tax regulations. You can clear local session storage anytime.
                  </span>
                </div>
                <div className="p-2.5 bg-[#F8FAFC] rounded-xl border border-neutral-200/70 text-[11.5px]">
                  <strong className="text-[#111827] block mb-0.5">10. Younger Users</strong>
                  <span className="text-[#64748B]">
                    If you are under 18, parental or guardian consent may be required under applicable laws for payment transactions and account registration.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ACCORDION 2: TECHNOLOGY & THIRD-PARTY SERVICES */}
      <div className="mt-3 bg-white rounded-[20px] border border-neutral-100/90 overflow-hidden shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
        <button
          type="button"
          onClick={() => toggleSection('techServices')}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-neutral-50/70 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-4 bg-[#0679FC] rounded-full" />
            <span className="text-[14px] font-bold text-[#111827]">Technology &amp; third-party services</span>
          </div>
          {openSections.techServices ? (
            <ChevronDown className="w-4 h-4 text-[#64748B]" />
          ) : (
            <ChevronRight className="w-4 h-4 text-[#64748B]" />
          )}
        </button>

        {openSections.techServices && (
          <div className="px-4 pb-5 pt-1 border-t border-[#F1F5F9] flex flex-col gap-4 text-[12.5px] text-[#334155]">
            {/* 4. Where is your information stored? */}
            <div id="privacy-storage" className="space-y-2">
              <h4 className="text-[13px] font-bold text-[#111827] flex items-center gap-1.5">
                <Database className="w-4 h-4 text-[#0679FC]" />
                4. Where is your information stored?
              </h4>
              <p className="text-[#64748B] text-[12px]">
                Depending on the configured deployment mode, information is stored across three layers:
              </p>

              <div className="space-y-2">
                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-neutral-200/70">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-[#16A34A]" />
                    <span className="text-[#111827] font-bold text-[12.5px]">On your device</span>
                  </div>
                  <p className="text-[#334155] text-[11.5px] mt-1 leading-relaxed">
                    Your active cart, recent order token, vegetarian food toggle, and appearance preferences are stored directly in your browser's local storage under the isolated namespace <code className="px-1.5 py-0.5 bg-neutral-100 rounded text-[#0F6E38] font-mono text-[10.5px] border border-neutral-200">opencanteen:{config.identity.id}:*</code>.
                  </p>
                  <p className="text-[#64748B] text-[11px] mt-1">
                    Clearing browser storage removes device-side information.
                  </p>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-neutral-200/70">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-[#0679FC]" />
                    <span className="text-[#111827] font-bold text-[12.5px]">In your canteen's database</span>
                  </div>
                  <p className="text-[#334155] text-[11.5px] mt-1 leading-relaxed">
                    When cloud synchronization or online canteen order dispatch is enabled by your operator, customer profiles, order tokens, and campus delivery addresses are stored in the operator's dedicated cloud database.
                  </p>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-neutral-200/70">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#D98218]" />
                    <span className="text-[#111827] font-bold text-[12.5px]">In external storage systems</span>
                  </div>
                  <p className="text-[#334155] text-[11.5px] mt-1 leading-relaxed">
                    Menu photography, brand icons, and food catalog images are cached via the web application's service worker and media edge CDN.
                  </p>
                </div>
              </div>
            </div>

            {/* 5. Technology and third-party services */}
            <div id="privacy-services" className="pt-2 border-t border-[#F1F5F9] space-y-2.5">
              <h4 className="text-[13px] font-bold text-[#111827] flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#D98218]" />
                5. Technology &amp; third-party service disclosures
              </h4>
              <p className="text-[#64748B] text-[12px]">
                Open Canteen supports modular deployment integrations. The following technologies may be used when the corresponding features are enabled:
              </p>

              {/* Service Disclosures Table / Grid */}
              <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
                <table className="w-full text-left text-[11.5px]">
                  <thead className="bg-[#F8FAFC] border-b border-neutral-200 text-[#475569] font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Service / Provider</th>
                      <th className="py-2.5 px-3">Purpose in Open Canteen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200/80 text-[#334155]">
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-[#111827] flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-[#0679FC] shrink-0" />
                        Firebase Authentication
                      </td>
                      <td className="py-2.5 px-3 text-[#64748B]">
                        Customer sign-in and session security (Configured)
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-[#111827] flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5 text-[#D98218] shrink-0" />
                        Google Cloud Firestore
                      </td>
                      <td className="py-2.5 px-3 text-[#64748B]">
                        Customer profiles and order record synchronization (Configured)
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-[#111827] flex items-center gap-1.5">
                        <Server className="w-3.5 h-3.5 text-[#7C3AED] shrink-0" />
                        Web Hosting &amp; PWA Cache
                      </td>
                      <td className="py-2.5 px-3 text-[#64748B]">
                        PWA delivery, HTTPS security, and Workbox offline caching
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-[#111827] flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                        Local Application Media
                      </td>
                      <td className="py-2.5 px-3 text-[#64748B]">
                        Menu photographs packaged directly with application (No external CDN tracking)
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-[#111827] flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-[#EF4444] shrink-0" />
                        Payment Processing Mode
                      </td>
                      <td className="py-2.5 px-3 text-[#64748B]">
                        Cash on Counter &amp; Simulated Demo Tokens (No external merchant gateway active)
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-[#111827] flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5 text-[#0D9488] shrink-0" />
                        Offline &amp; Device Storage
                      </td>
                      <td className="py-2.5 px-3 text-[#64748B]">
                        Local browser storage for cart tokens and UI display preferences
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Active Verified Services Box */}
              <div className="p-3 bg-[#EBFAF0]/60 border border-[#D1F2DD] rounded-xl">
                <div className="flex items-center gap-2 text-[#16A34A] font-bold text-[12px]">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                  Services active for this canteen:
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-1 rounded-full bg-white border border-[#D1F2DD] text-[#0F6E38] text-[11px] font-medium shadow-2xs">
                    ✓ Browser Local Storage (Partitioned)
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-white border border-[#D1F2DD] text-[#0F6E38] text-[11px] font-medium shadow-2xs">
                    ✓ Progressive Web App Offline Engine
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-white border border-[#D1F2DD] text-[#0F6E38] text-[11px] font-medium shadow-2xs">
                    ✓ Self-Hosted Canteen Order Dispatch
                  </span>
                </div>
                <p className="mt-2 text-[10.5px] text-[#16A34A]/90">
                  Only verified active providers process information for this deployment.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ACCORDION 3: YOUR PRIVACY RIGHTS & REQUESTS */}
      <div className="mt-3 bg-white rounded-[20px] border border-neutral-100/90 overflow-hidden shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
        <button
          type="button"
          onClick={() => toggleSection('rightsRequests')}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-neutral-50/70 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-4 bg-[#F05360] rounded-full" />
            <span className="text-[14px] font-bold text-[#111827]">Your privacy rights &amp; requests</span>
          </div>
          {openSections.rightsRequests ? (
            <ChevronDown className="w-4 h-4 text-[#64748B]" />
          ) : (
            <ChevronRight className="w-4 h-4 text-[#64748B]" />
          )}
        </button>

        {openSections.rightsRequests && (
          <div className="px-4 pb-5 pt-1 border-t border-[#F1F5F9] flex flex-col gap-4 text-[12.5px] text-[#334155]">
            {/* 8. Manage your privacy */}
            <div id="privacy-controls" className="space-y-2">
              <h4 className="text-[13px] font-bold text-[#111827] flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-[#EF5350]" />
                8. Manage your privacy
              </h4>
              <p className="text-[#64748B] text-[12px]">
                You have direct control over your personal information and stored preferences:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {/* Action 1: Edit Profile */}
                <button
                  type="button"
                  onClick={() => handleActionClick('editProfile')}
                  className="p-3 rounded-xl bg-white hover:bg-neutral-50 border border-neutral-200/80 shadow-2xs flex items-center justify-between text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#EBFAF0] flex items-center justify-center text-[#16A34A] shrink-0">
                      <User className="w-4 h-4 text-[#16A34A]" />
                    </div>
                    <div>
                      <div className="text-[12px] font-bold text-[#111827]">Edit Personal Information</div>
                      <div className="text-[10.5px] text-[#64748B]">Update name, phone, or email</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
                </button>

                {/* Action 2: Manage Addresses */}
                <button
                  type="button"
                  onClick={() => handleActionClick('addressBook')}
                  className="p-3 rounded-xl bg-white hover:bg-neutral-50 border border-neutral-200/80 shadow-2xs flex items-center justify-between text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#EBF5FF] flex items-center justify-center text-[#0679FC] shrink-0">
                      <Database className="w-4 h-4 text-[#0679FC]" />
                    </div>
                    <div>
                      <div className="text-[12px] font-bold text-[#111827]">Manage Saved Addresses</div>
                      <div className="text-[10.5px] text-[#64748B]">Review or delete hostel rooms</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
                </button>

                {/* Action 3: Appearance Preferences */}
                <button
                  type="button"
                  onClick={() => handleActionClick('appearance')}
                  className="p-3 rounded-xl bg-white hover:bg-neutral-50 border border-neutral-200/80 shadow-2xs flex items-center justify-between text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#FEF6E4] flex items-center justify-center text-[#D98218] shrink-0">
                      <Sliders className="w-4 h-4 text-[#D98218]" />
                    </div>
                    <div>
                      <div className="text-[12px] font-bold text-[#111827]">Theme &amp; Dietary Preferences</div>
                      <div className="text-[10.5px] text-[#64748B]">Vegetarian mode, appearance</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
                </button>

                {/* Action 4: Clear Device Cache */}
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="p-3 rounded-xl bg-white hover:bg-rose-50/60 border border-neutral-200/80 hover:border-rose-200 shadow-2xs flex items-center justify-between text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#FCEAEA] flex items-center justify-center text-[#EF5350] shrink-0">
                      <Trash2 className="w-4 h-4 text-[#EF5350]" />
                    </div>
                    <div>
                      <div className="text-[12px] font-bold text-[#EF5350]">Clear Local Device Cache</div>
                      <div className="text-[10.5px] text-[#64748B]">Reset saved browser storage</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
                </button>
              </div>

              {/* Data Rights & Deletion Information */}
              <div className="mt-3 p-3 bg-[#F8FAFC] rounded-xl border border-neutral-200/70 text-[11.5px] text-[#334155] space-y-2">
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#111827] block font-semibold">Request a copy of your information</strong>
                    <span className="text-[#64748B]">
                      Contact your canteen operator to request a digital export of personal information and completed order receipts associated with your account.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-2 border-t border-neutral-200/80">
                  <AlertCircle className="w-4 h-4 text-[#EF5350] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#111827] block font-semibold">Request account or data deletion</strong>
                    <span className="text-[#64748B]">
                      You may ask the canteen operator to delete your profile and personal information. Deleting an account will clear saved details, subject to legitimate transaction records required for tax and legal compliance.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 11. Privacy questions and requests */}
            <div className="pt-2 border-t border-[#F1F5F9] space-y-2">
              <h4 className="text-[13px] font-bold text-[#111827] flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-[#16A34A]" />
                11. Privacy questions and requests
              </h4>
              <p className="text-[#334155] text-[12px]">
                Have a question about your account or want to submit a formal privacy inquiry?
              </p>

              <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-neutral-200/70 flex flex-col gap-2 text-[12px]">
                <div className="flex justify-between items-center">
                  <span className="text-[#64748B]">Canteen:</span>
                  <span className="font-bold text-[#111827]">{canteenName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#64748B]">Operator:</span>
                  <span className="font-medium text-[#334155]">{operatorName}</span>
                </div>
                {privacyEmail && (
                  <div className="flex justify-between items-center">
                    <span className="text-[#64748B]">Privacy contact:</span>
                    <a
                      href={`mailto:${privacyEmail}`}
                      className="font-bold text-[#16A34A] hover:underline"
                    >
                      {privacyEmail}
                    </a>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-[#64748B]">Support hours:</span>
                  <span className="text-[#334155] font-medium">{operatingHours}</span>
                </div>
              </div>
            </div>

            {/* 12. Read our complete policies */}
            <div className="pt-2 border-t border-[#F1F5F9] space-y-2">
              <h4 className="text-[13px] font-bold text-[#111827] flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#0679FC]" />
                12. Read our complete policies
              </h4>
              <p className="text-[#64748B] text-[11.5px] leading-relaxed">
                This page is a clear, convenient explanation of account privacy. For complete details regarding personal data processing, retention, provider contracts, and dispute resolution, please review the complete policies:
              </p>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/profile/legal/privacy-policy')}
                  className="flex-1 p-3 rounded-xl bg-white hover:bg-neutral-50 border border-neutral-200 text-left transition-colors cursor-pointer shadow-2xs"
                >
                  <strong className="text-[#111827] block font-semibold hover:text-[#16A34A]">Privacy Policy →</strong>
                  <span className="text-[#64748B] text-[10.5px]">Complete data protection notice</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/profile/legal/terms-of-service')}
                  className="flex-1 p-3 rounded-xl bg-white hover:bg-neutral-50 border border-neutral-200 text-left transition-colors cursor-pointer shadow-2xs"
                >
                  <strong className="text-[#111827] block font-semibold hover:text-[#16A34A]">Terms of Service →</strong>
                  <span className="text-[#64748B] text-[10.5px]">Conditions for campus ordering</span>
                </button>
              </div>

              <div className="flex justify-between items-center text-[10.5px] text-[#94A3B8] pt-1">
                <span>Last updated: {effectiveDate}</span>
                <span>Privacy notice: {policyVersion}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CONFIRMATION MODAL FOR CLEAR CACHE */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 max-w-sm w-full shadow-2xl">
            <h3 className="text-[15px] font-bold text-[#111827] flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-[#EF5350]" />
              Clear Local Cache?
            </h3>
            <p className="text-[12px] text-[#475569] mt-2 leading-relaxed">
              This will remove cached cart items and temporary UI state from this browser. Your registered profile and completed orders remain safe.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200/80 text-[#334155] text-[12px] font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearLocalCache}
                className="flex-1 py-2 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white text-[12px] font-bold cursor-pointer shadow-xs"
              >
                Clear Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER ATTRIBUTION */}
      <div className="mt-5 text-center text-[11px] text-[#64748B]">
        <p className="italic">
          Powered by <strong className="text-[#334155] font-semibold">Open Canteen</strong> — Open-source canteen ordering and management software.
        </p>
        <p className="text-[10px] text-[#94A3B8] mt-0.5">
          Suggested mobile-first layout, using each canteen's configured branding and actual service disclosures.
        </p>
      </div>

      {isSheet && onClose && (
        <div className="mt-4 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#111827] hover:bg-[#1E293B] text-white text-[13px] font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
};
