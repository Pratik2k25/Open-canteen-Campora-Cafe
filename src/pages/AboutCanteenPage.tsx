import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Store,
  MapPin,
  Clock,
  Phone,
  Mail,
  Utensils,
  ShoppingBag,
  Bike,
  ExternalLink,
  Info,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useCanteen } from '../context/CanteenContext.tsx';
import { OpenCanteenBrandMark } from '../components/OpenCanteenBrandMark.tsx';

const isDialablePhone = (phone?: string): boolean => {
  if (!phone) return false;
  if (/[a-zA-Z]/.test(phone)) return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 7;
};

export const AboutCanteenPage: React.FC = () => {
  const navigate = useNavigate();
  const { config } = useCanteen();

  const canteenName = config.identity.displayName || 'Open Canteen';
  const tagline = config.identity.tagline || 'Good food, made convenient.';
  const primaryColor = config.branding.primaryColor || '#166534';
  const accentColor = config.branding.accentColor || '#FB4816';

  // Story: configured custom story or authentic default
  const story =
    config.content.canteenStory ||
    config.content.aboutBody ||
    `Welcome to ${canteenName}. We're here to make your everyday food experience simple, comfortable, and convenient. From discovering what's on the menu to placing your next order, our goal is to help you enjoy a smoother canteen experience. Explore our menu, find something you love, and order in the way that works best for you.`;

  // Services availability (Dine-in, Takeaway are standard; Delivery is supported when locations exist)
  const pickupLocations = config.location.pickupLocations || [];
  const displayLocation = config.location.displayLocation || 'Central Campus Dining Hall';
  const addressLine = config.location.addressLine;
  const mapUrl =
    config.location.mapUrl ||
    (addressLine ? `https://maps.google.com/?q=${encodeURIComponent(addressLine)}` : undefined);

  const phone = config.contact.supportPhone;
  const email = config.contact.supportEmail;
  const hours = config.contact.operatingHours;

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
            <div className="min-w-0">
              <h1 className="text-[16px] font-bold text-[#111827] tracking-tight leading-none truncate max-w-[240px]">
                About {canteenName}
              </h1>
              <p className="text-[11px] text-[#64748B] mt-0.5 truncate">
                Canteen Details &amp; Story
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {config.identity.id === 'open-canteen' ? (
              <OpenCanteenBrandMark variant="icon" theme="light" className="h-5 w-auto" />
            ) : (
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[12px] text-white shadow-xs"
                style={{ backgroundColor: primaryColor }}
              >
                {config.identity.monogram || 'OC'}
              </div>
            )}
          </div>
        </header>

        {/* MAIN BODY CONTENT */}
        <main className="flex-1 p-3.5 sm:p-4 space-y-3.5">
          {/* SECTION A: BRAND HERO */}
          <div className="bg-white rounded-[20px] p-5 border border-neutral-100/90 shadow-[0_2px_10px_rgba(15,23,42,0.03)] relative overflow-hidden text-center flex flex-col items-center">
            {/* Ambient decorative glow */}
            <div
              className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full opacity-10 blur-2xl pointer-events-none"
              style={{ backgroundColor: primaryColor }}
            />

            {/* Logo container */}
            <div className="w-16 h-16 rounded-2xl bg-[#F8FAFC] border border-neutral-200/80 flex items-center justify-center shadow-xs relative z-10 mb-3 p-2">
              {config.identity.id === 'open-canteen' ? (
                <OpenCanteenBrandMark variant="icon" theme="light" className="h-10 w-10" />
              ) : config.identity.logoUrl ? (
                <img
                  src={config.identity.logoUrl}
                  alt={canteenName}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div
                  className="w-full h-full rounded-xl flex items-center justify-center text-white font-bold text-[18px]"
                  style={{ backgroundColor: primaryColor }}
                >
                  {config.identity.monogram || 'OC'}
                </div>
              )}
            </div>

            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-[#EBFAF0] text-[#16A34A] border border-[#D1F2DD] mb-2">
                <Store className="w-3 h-3" />
                Campus Dining Service
              </span>
              <h2 className="text-[20px] font-bold text-[#111827] tracking-tight">
                {canteenName}
              </h2>
              <p className="text-[13px] text-[#64748B] mt-1 max-w-[280px] leading-snug">
                {tagline}
              </p>
            </div>
          </div>

          {/* SECTION B: OUR STORY */}
          <div className="bg-white rounded-[20px] p-4 sm:p-5 border border-neutral-100/90 shadow-[0_2px_10px_rgba(15,23,42,0.03)] space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#19B559] rounded-full" />
              <h3 className="text-[14px] font-bold text-[#111827]">Our Story</h3>
            </div>
            <p className="text-[12.5px] text-[#334155] leading-relaxed whitespace-pre-line">
              {story}
            </p>
          </div>

          {/* SECTION C: HOW WE SERVE YOU */}
          <div className="bg-white rounded-[20px] p-4 sm:p-5 border border-neutral-100/90 shadow-[0_2px_10px_rgba(15,23,42,0.03)] space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#0679FC] rounded-full" />
              <h3 className="text-[14px] font-bold text-[#111827]">How We Serve You</h3>
            </div>
            {config.content.servicesDescription && (
              <p className="text-[12px] text-[#64748B] leading-relaxed">
                {config.content.servicesDescription}
              </p>
            )}

            <div className="grid grid-cols-1 gap-2 text-[12px]">
              {/* Dine-In */}
              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-neutral-200/70 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#EBFAF0] border border-[#D1F2DD] flex items-center justify-center shrink-0 text-[#16A34A]">
                  <Utensils className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-[#111827] flex items-center gap-2">
                    Dine-in
                    <span className="text-[9.5px] font-semibold uppercase px-1.5 py-0.5 rounded bg-[#EBFAF0] text-[#16A34A]">
                      Active
                    </span>
                  </div>
                  <p className="text-[11.5px] text-[#64748B] mt-0.5 leading-snug">
                    Enjoy your meal at the canteen and use the available ordering options.
                  </p>
                </div>
              </div>

              {/* Takeaway */}
              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-neutral-200/70 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#FEF6E4] border border-[#FDE68A] flex items-center justify-center shrink-0 text-[#D98218]">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-[#111827] flex items-center gap-2">
                    Takeaway
                    <span className="text-[9.5px] font-semibold uppercase px-1.5 py-0.5 rounded bg-[#FEF6E4] text-[#D98218]">
                      Active
                    </span>
                  </div>
                  <p className="text-[11.5px] text-[#64748B] mt-0.5 leading-snug">
                    Place an order for pickup and collect it from the designated counter.
                  </p>
                </div>
              </div>

              {/* Delivery */}
              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-neutral-200/70 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#EBF5FF] border border-[#BAE6FD] flex items-center justify-center shrink-0 text-[#0679FC]">
                  <Bike className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-[#111827] flex items-center gap-2">
                    Campus Delivery
                    <span className="text-[9.5px] font-semibold uppercase px-1.5 py-0.5 rounded bg-[#EBF5FF] text-[#0679FC]">
                      Active
                    </span>
                  </div>
                  <p className="text-[11.5px] text-[#64748B] mt-0.5 leading-snug">
                    Order to an eligible delivery location, subject to the canteen's service availability.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION D: FIND US */}
          <div className="bg-white rounded-[20px] p-4 sm:p-5 border border-neutral-100/90 shadow-[0_2px_10px_rgba(15,23,42,0.03)] space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#D98218] rounded-full" />
              <h3 className="text-[14px] font-bold text-[#111827]">Find Us</h3>
            </div>

            <div className="space-y-2 text-[12px]">
              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-neutral-200/70 flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <strong className="text-[#111827] block font-semibold">{displayLocation}</strong>
                  {addressLine && (
                    <span className="text-[#64748B] text-[11.5px] block mt-0.5">
                      {addressLine}
                    </span>
                  )}
                  {mapUrl && (
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#16A34A] hover:underline mt-2"
                    >
                      <span>Open in Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {hours && (
                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-neutral-200/70 flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-[#D98218] shrink-0" />
                  <div>
                    <span className="text-[#64748B] text-[11px] block">Service Hours</span>
                    <strong className="text-[#111827] text-[12px]">{hours}</strong>
                  </div>
                </div>
              )}

              {pickupLocations.length > 0 && (
                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-neutral-200/70">
                  <span className="text-[#64748B] text-[11px] font-semibold uppercase block mb-1.5">
                    Pickup Stations
                  </span>
                  <div className="space-y-1">
                    {pickupLocations.map((loc, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[11.5px] text-[#334155]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] shrink-0" />
                        <span>{loc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION E: GET IN TOUCH */}
          <div className="bg-white rounded-[20px] p-4 sm:p-5 border border-neutral-100/90 shadow-[0_2px_10px_rgba(15,23,42,0.03)] space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#0D9488] rounded-full" />
              <h3 className="text-[14px] font-bold text-[#111827]">Get in Touch</h3>
            </div>
            <p className="text-[12px] text-[#64748B] leading-snug">
              Need help with an order or have a question about our services? We're here to help.
            </p>

            <div className="space-y-2 text-[12px]">
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="p-3 rounded-xl bg-[#F8FAFC] hover:bg-neutral-100/80 border border-neutral-200/70 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#EBFAF0] flex items-center justify-center text-[#16A34A] shrink-0">
                      <Mail className="w-4 h-4 text-[#16A34A]" />
                    </div>
                    <div>
                      <span className="text-[#64748B] text-[10.5px] block">Support Email</span>
                      <span className="text-[#111827] font-medium">{email}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
                </a>
              )}

              {phone && isDialablePhone(phone) && (
                <a
                  href={`tel:${phone.replace(/[^\d+]/g, '')}`}
                  className="p-3 rounded-xl bg-[#F8FAFC] hover:bg-neutral-100/80 border border-neutral-200/70 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#EBF5FF] flex items-center justify-center text-[#0679FC] shrink-0">
                      <Phone className="w-4 h-4 text-[#0679FC]" />
                    </div>
                    <div>
                      <span className="text-[#64748B] text-[10.5px] block">Telephone</span>
                      <span className="text-[#111827] font-medium">{phone}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
                </a>
              )}

              <button
                type="button"
                onClick={() => navigate('/profile?sheet=helpSupport')}
                className="w-full p-3 rounded-xl bg-[#F8FAFC] hover:bg-neutral-100/80 border border-neutral-200/70 flex items-center justify-between text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#FEF6E4] flex items-center justify-center text-[#D98218] shrink-0">
                    <Info className="w-4 h-4 text-[#D98218]" />
                  </div>
                  <div>
                    <span className="text-[#111827] font-medium block">Canteen Help &amp; Support</span>
                    <span className="text-[#64748B] text-[10.5px] block">Live counter desk guidance</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
              </button>
            </div>
          </div>

          {/* SECTION F: POWERED BY OPEN CANTEEN */}
          <div className="bg-white rounded-[20px] p-4 sm:p-5 border border-neutral-100/90 shadow-[0_2px_10px_rgba(15,23,42,0.03)] text-center space-y-2">
            <div className="flex justify-center mb-1">
              <OpenCanteenBrandMark variant="icon" theme="light" className="h-6 w-auto" />
            </div>
            <h4 className="text-[13px] font-bold text-[#111827]">Powered by Open Canteen</h4>
            <p className="text-[11.5px] text-[#64748B] leading-relaxed max-w-xs mx-auto">
              This canteen uses Open Canteen, an open-source platform designed to make canteen ordering and management more convenient.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate('/profile/about-open-canteen')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200/80 border border-neutral-200 text-[#111827] text-[11.5px] font-semibold transition-colors cursor-pointer"
              >
                <span>About Open Canteen Platform</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#64748B]" />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
