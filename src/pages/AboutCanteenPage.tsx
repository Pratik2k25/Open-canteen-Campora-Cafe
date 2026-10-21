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
    <div className="min-h-screen bg-[#070A0F] text-neutral-100 flex flex-col items-center">
      <div className="w-full max-w-[440px] min-h-screen flex flex-col relative shadow-2xl bg-[#070A0F] pb-16">
        {/* TOP STICKY HEADER */}
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
            <div className="min-w-0">
              <h1 className="text-[15px] font-bold text-white tracking-tight leading-none truncate max-w-[240px]">
                About {canteenName}
              </h1>
              <p className="text-[11px] text-neutral-400 mt-0.5 truncate">
                Canteen Details &amp; Story
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {config.identity.id === 'open-canteen' ? (
              <OpenCanteenBrandMark variant="icon" theme="contrast" className="h-5 w-5" />
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
          <div className="bg-[#0B0F17] rounded-2xl p-5 border border-neutral-800 shadow-xl relative overflow-hidden text-center flex flex-col items-center">
            {/* Ambient decorative glow */}
            <div
              className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full opacity-15 blur-2xl pointer-events-none"
              style={{ backgroundColor: primaryColor }}
            />

            {/* Logo container */}
            <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-700/80 flex items-center justify-center shadow-lg relative z-10 mb-3 p-2">
              {config.identity.id === 'open-canteen' ? (
                <OpenCanteenBrandMark variant="icon" theme="dark" className="h-10 w-10" />
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
              <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 mb-2">
                <Store className="w-3 h-3" />
                Campus Dining Service
              </span>
              <h2 className="text-[20px] font-bold text-white tracking-tight">
                {canteenName}
              </h2>
              <p className="text-[13px] text-neutral-300 mt-1 max-w-[280px] leading-snug">
                {tagline}
              </p>
            </div>
          </div>

          {/* SECTION B: OUR STORY */}
          <div className="bg-[#0B0F17] rounded-2xl p-4 sm:p-5 border border-neutral-800 shadow-md space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4 bg-emerald-500 rounded-full" />
              <h3 className="text-[14px] font-bold text-white">Our Story</h3>
            </div>
            <p className="text-[12.5px] text-neutral-300 leading-relaxed whitespace-pre-line">
              {story}
            </p>
          </div>

          {/* SECTION C: HOW WE SERVE YOU */}
          <div className="bg-[#0B0F17] rounded-2xl p-4 sm:p-5 border border-neutral-800 shadow-md space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4 bg-blue-500 rounded-full" />
              <h3 className="text-[14px] font-bold text-white">How We Serve You</h3>
            </div>
            {config.content.servicesDescription && (
              <p className="text-[12px] text-neutral-400 leading-relaxed">
                {config.content.servicesDescription}
              </p>
            )}

            <div className="grid grid-cols-1 gap-2 text-[12px]">
              {/* Dine-In */}
              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center shrink-0 text-emerald-400">
                  <Utensils className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-white flex items-center gap-2">
                    Dine-in
                    <span className="text-[9.5px] font-semibold uppercase px-1.5 py-0.5 rounded bg-emerald-900/50 text-emerald-300">
                      Active
                    </span>
                  </div>
                  <p className="text-[11.5px] text-neutral-400 mt-0.5 leading-snug">
                    Enjoy your meal at the canteen and use the available ordering options.
                  </p>
                </div>
              </div>

              {/* Takeaway */}
              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-800/60 flex items-center justify-center shrink-0 text-amber-400">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-white flex items-center gap-2">
                    Takeaway
                    <span className="text-[9.5px] font-semibold uppercase px-1.5 py-0.5 rounded bg-amber-900/50 text-amber-300">
                      Active
                    </span>
                  </div>
                  <p className="text-[11.5px] text-neutral-400 mt-0.5 leading-snug">
                    Place an order for pickup and collect it from the designated counter.
                  </p>
                </div>
              </div>

              {/* Delivery */}
              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-950/80 border border-blue-800/60 flex items-center justify-center shrink-0 text-blue-400">
                  <Bike className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-white flex items-center gap-2">
                    Campus Delivery
                    <span className="text-[9.5px] font-semibold uppercase px-1.5 py-0.5 rounded bg-blue-900/50 text-blue-300">
                      Active
                    </span>
                  </div>
                  <p className="text-[11.5px] text-neutral-400 mt-0.5 leading-snug">
                    Order to an eligible delivery location, subject to the canteen's service availability.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION D: FIND US */}
          <div className="bg-[#0B0F17] rounded-2xl p-4 sm:p-5 border border-neutral-800 shadow-md space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
              <h3 className="text-[14px] font-bold text-white">Find Us</h3>
            </div>

            <div className="space-y-2 text-[12px]">
              <div className="p-3 rounded-xl bg-neutral-900/70 border border-neutral-800 flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <strong className="text-white block font-semibold">{displayLocation}</strong>
                  {addressLine && (
                    <span className="text-neutral-400 text-[11.5px] block mt-0.5">
                      {addressLine}
                    </span>
                  )}
                  {mapUrl && (
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:underline mt-2"
                    >
                      <span>Open in Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {hours && (
                <div className="p-3 rounded-xl bg-neutral-900/70 border border-neutral-800 flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-neutral-400 text-[11px] block">Service Hours</span>
                    <strong className="text-white text-[12px]">{hours}</strong>
                  </div>
                </div>
              )}

              {pickupLocations.length > 0 && (
                <div className="p-3 rounded-xl bg-neutral-900/70 border border-neutral-800">
                  <span className="text-neutral-400 text-[11px] font-semibold uppercase block mb-1.5">
                    Pickup Stations
                  </span>
                  <div className="space-y-1">
                    {pickupLocations.map((loc, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[11.5px] text-neutral-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        <span>{loc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION E: GET IN TOUCH */}
          <div className="bg-[#0B0F17] rounded-2xl p-4 sm:p-5 border border-neutral-800 shadow-md space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4 bg-teal-500 rounded-full" />
              <h3 className="text-[14px] font-bold text-white">Get in Touch</h3>
            </div>
            <p className="text-[12px] text-neutral-400 leading-snug">
              Need help with an order or have a question about our services? We're here to help.
            </p>

            <div className="space-y-2 text-[12px]">
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="p-3 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="text-neutral-400 text-[10.5px] block">Support Email</span>
                      <span className="text-white font-medium">{email}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-500" />
                </a>
              )}

              {phone && isDialablePhone(phone) && (
                <a
                  href={`tel:${phone.replace(/[^\d+]/g, '')}`}
                  className="p-3 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-blue-400" />
                    <div>
                      <span className="text-neutral-400 text-[10.5px] block">Telephone</span>
                      <span className="text-white font-medium">{phone}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-500" />
                </a>
              )}

              <button
                type="button"
                onClick={() => navigate('/profile?sheet=helpSupport')}
                className="w-full p-3 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 flex items-center justify-between text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Info className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="text-white font-medium">Canteen Help &amp; Support</span>
                    <span className="text-neutral-400 text-[10.5px] block">Live counter desk guidance</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-500" />
              </button>
            </div>
          </div>

          {/* SECTION F: POWERED BY OPEN CANTEEN */}
          <div className="bg-[#0B0F17] rounded-2xl p-4 sm:p-5 border border-neutral-800 shadow-md text-center space-y-2">
            <div className="flex justify-center mb-1">
              <OpenCanteenBrandMark variant="icon" theme="contrast" className="h-6 w-auto" />
            </div>
            <h4 className="text-[13px] font-bold text-white">Powered by Open Canteen</h4>
            <p className="text-[11.5px] text-neutral-400 leading-relaxed max-w-xs mx-auto">
              This canteen uses Open Canteen, an open-source platform designed to make canteen ordering and management more convenient.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate('/profile/about-open-canteen')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-[11.5px] font-semibold transition-colors cursor-pointer"
              >
                <span>About Open Canteen Platform</span>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
