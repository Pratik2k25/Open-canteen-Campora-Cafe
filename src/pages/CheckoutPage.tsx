import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingBag,
  UtensilsCrossed,
  Truck,
  Receipt,
  ShieldCheck,
  CreditCard,
  Building,
  MapPin,
  Phone,
  User,
  Clock,
  Sparkles,
  Info,
  Check,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useOrders } from '../context/OrderContext.tsx';
import { useCanteen } from '../context/CanteenContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { mockProfileAdapter } from '../adapters/mockProfileAdapter.ts';
import { formatINR } from '../utils/pricing.ts';
import { getServiceTheme } from '../utils/serviceTheme.ts';
import { getServiceModeLabel } from '../utils/serviceRules.ts';
import type { SavedAddress } from '../types/index.ts';

export type DemoPaymentMethod = 'demo_upi' | 'cash' | 'campus_card';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { config } = useCanteen();
  const { user } = useAuth();
  const { items, pricing, serviceMode, clearCart } = useCart();
  const { placeOrder } = useOrders();

  const operatorId = config?.identity?.id || 'campora-cafe';
  const canteenName = config?.identity?.displayName || 'Campora Café';
  const displayLocation = config?.location?.displayLocation || 'Campus Cafeteria';
  const serviceTheme = getServiceTheme(serviceMode);

  // Form State
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [tableNumber, setTableNumber] = useState<string>('');
  const [pickupLocation, setPickupLocation] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState<string>('');

  // Delivery-specific State
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('custom');
  const [customBuilding, setCustomBuilding] = useState<string>('');
  const [customRoomLandmark, setCustomRoomLandmark] = useState<string>('');
  const [saveCustomAddress, setSaveCustomAddress] = useState<boolean>(false);

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<DemoPaymentMethod>('demo_upi');

  // Submission & Validation State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Prefill customer profile & addresses for active operator
  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      try {
        const profile = await mockProfileAdapter.getProfile(operatorId);
        if (!isMounted) return;

        // Prefill name & phone
        const defaultFallbackName = operatorId === 'campora-cafe' ? 'Pratik Kumar' : 'Guest Customer';
        const defaultFallbackPhone = operatorId === 'campora-cafe' ? '+91 98765 43210' : '';
        const defaultName = profile.displayName || user?.displayName || defaultFallbackName;
        const defaultPhone = profile.phoneNumber || user?.phoneNumber || defaultFallbackPhone;
        setCustomerName((prev) => (prev ? prev : defaultName));
        setCustomerPhone((prev) => (prev ? prev : defaultPhone));

        // Prefill addresses
        const addrs = profile.savedAddresses || [];
        setSavedAddresses(addrs);
        if (addrs.length > 0) {
          const defaultAddr = addrs.find((a) => a.isDefault) || addrs[0];
          setSelectedAddressId(defaultAddr.id);
        } else {
          setSelectedAddressId('custom');
        }
      } catch (err) {
        console.warn('Could not load profile for checkout prefill:', err);
      }
    };

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [operatorId, user]);

  // Set default pickup location from operator config
  useEffect(() => {
    const locations = config?.location?.pickupLocations || [];
    if (locations.length > 0 && !pickupLocation) {
      setPickupLocation(locations[0]);
    }
  }, [config, pickupLocation]);

  const isCartEmpty = items.length === 0;

  // Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!customerName.trim() || customerName.trim().length < 2) {
      errors.customerName = 'Please enter your name (at least 2 characters)';
    }

    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (!customerPhone.trim() || cleanPhone.length < 10) {
      errors.customerPhone = 'Please enter a valid 10-digit mobile number';
    }

    if (serviceMode === 'delivery') {
      if (selectedAddressId === 'custom') {
        if (!customBuilding.trim()) {
          errors.customBuilding = 'Hostel, department, or building name is required';
        }
        if (!customRoomLandmark.trim()) {
          errors.customRoomLandmark = 'Room, floor, or landmark is required';
        }
      }
    }

    if (serviceMode === 'takeaway') {
      if (!pickupLocation.trim()) {
        errors.pickupLocation = 'Please select a pickup counter';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirmOrder = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    if (isCartEmpty) {
      setSubmitError('Your cart is empty. Add items before placing an order.');
      return;
    }

    if (!validateForm()) {
      setSubmitError('Please complete all required fields highlighted below.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Build pickup or delivery summary
      let deliveryAddressText: string | undefined = undefined;
      if (serviceMode === 'delivery') {
        if (selectedAddressId === 'custom') {
          deliveryAddressText = `${customBuilding.trim()}, ${customRoomLandmark.trim()}`;
          // Optionally save to profile
          if (saveCustomAddress) {
            mockProfileAdapter.addSavedAddress(operatorId, {
              userId: user?.uid || 'customer-demo-1',
              label: 'Other',
              buildingOrGate: customBuilding.trim(),
              roomOrLandmark: customRoomLandmark.trim(),
              recipientPhone: customerPhone.trim(),
              isDefault: false,
            }).catch((err) => console.warn('Failed to save address:', err));
          }
        } else {
          const selected = savedAddresses.find((a) => a.id === selectedAddressId);
          if (selected) {
            deliveryAddressText = `${selected.buildingOrGate}, ${selected.roomOrLandmark} (${selected.label})`;
          }
        }
      }

      const paymentMethodLabels: Record<DemoPaymentMethod, string> = {
        demo_upi: 'Demo UPI (Simulated)',
        cash: serviceMode === 'delivery' ? 'Cash on Delivery (Demo)' : 'Cash at Counter (Demo)',
        campus_card: 'Campus Card (Demo)',
      };

      const orderPayload = {
        serviceMode,
        items,
        pricing,
        paymentMethod: paymentMethodLabels[paymentMethod],
        customerName: customerName.trim(),
        pickupOrDeliveryDetails: {
          tableNumber: serviceMode === 'dinein' && tableNumber.trim() ? tableNumber.trim() : undefined,
          pickupTimeEstimate: serviceMode === 'takeaway' ? pickupLocation : undefined,
          deliveryAddress: deliveryAddressText,
          contactNumber: customerPhone.trim(),
          notes: orderNotes.trim() || undefined,
        },
      };

      // 1. Persist the mock order
      const createdOrder = await placeOrder(orderPayload);

      // 2. Clear cart strictly AFTER persistence succeeds
      clearCart();

      // 3. Navigate to confirmation screen
      navigate(`/order-confirmation/${createdOrder.orderId}`);
    } catch (err: unknown) {
      console.error('Order placement failed:', err);
      const msg = err instanceof Error ? err.message : 'Order placement failed. Please try again.';
      setSubmitError(msg);
      // Ensure cart is preserved on failure
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      data-testid="checkout-page"
      className="min-h-screen bg-[#F8FAFC] text-neutral-900 pb-36 flex flex-col items-center select-none"
    >
      <div className="w-full max-w-[430px] min-h-screen bg-[#F8FAFC] flex flex-col relative shadow-sm">
        {/* ================================================================= */}
        {/* A. CHECKOUT HEADER                                                */}
        {/* ================================================================= */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/cart')}
              aria-label="Back to Cart"
              data-testid="checkout-back-btn"
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-neutral-100 active:scale-95 text-neutral-700 transition cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-[16px] font-extrabold text-[#0F172A] leading-tight">
                  Checkout
                </h1>
                <span className="w-1.5 h-1.5 rounded-full bg-[#136B3C]" />
              </div>
              <p className="text-[11px] font-medium text-neutral-500 leading-none mt-0.5 truncate max-w-[210px]">
                {canteenName} • {displayLocation}
              </p>
            </div>
          </div>

          {/* Active Service Badge */}
          <div
            className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1 border ${
              serviceMode === 'dinein'
                ? 'bg-[#E9FBF1] text-[#0E6B39] border-[#36B871]/30'
                : serviceMode === 'takeaway'
                ? 'bg-[#FEF3C7] text-[#9A4A12] border-[#E29B61]/30'
                : 'bg-[#E0F2FE] text-[#0D528C] border-[#5BA8E6]/30'
            }`}
          >
            {serviceMode === 'dinein' ? (
              <UtensilsCrossed className="w-3 h-3 stroke-[2.2]" />
            ) : serviceMode === 'takeaway' ? (
              <ShoppingBag className="w-3 h-3 stroke-[2.2]" />
            ) : (
              <Truck className="w-3 h-3 stroke-[2.2]" />
            )}
            <span>{getServiceModeLabel(serviceMode)}</span>
          </div>
        </header>

        {/* Empty Cart Prevention View */}
        {isCartEmpty ? (
          <div
            data-testid="checkout-empty-state"
            className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center"
          >
            <div className="w-20 h-20 rounded-3xl bg-neutral-100 flex items-center justify-center text-neutral-400 mb-4 shadow-inner">
              <ShoppingBag className="w-10 h-10 stroke-[1.6]" />
            </div>
            <h2 className="text-[17px] font-extrabold text-[#0F172A]">
              Your cart is empty
            </h2>
            <p className="text-[12.5px] text-neutral-500 mt-1 max-w-[260px]">
              You must add at least one delicious item from {canteenName} before checking out.
            </p>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="mt-5 px-6 py-2.5 bg-[#136B3C] text-white text-xs font-bold rounded-full shadow-xs cursor-pointer hover:bg-[#0f5730] transition"
            >
              Explore Menu
            </button>
          </div>
        ) : (
          <main className="flex-1 flex flex-col gap-3.5 px-4 pt-3.5 pb-6">
            {/* Error Notification Banner */}
            {submitError && (
              <div
                data-testid="checkout-error-banner"
                role="alert"
                className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-3 flex items-start gap-2.5 text-xs animate-in fade-in"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold">Checkout Notice</p>
                  <p className="mt-0.5 leading-relaxed">{submitError}</p>
                </div>
              </div>
            )}

            {/* ============================================================= */}
            {/* B. ORDER SUMMARY                                              */}
            {/* ============================================================= */}
            <section
              aria-label="Order Summary"
              className="bg-white rounded-2xl p-4 border border-neutral-200/80 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between pb-1 border-b border-neutral-100">
                <div className="flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-neutral-600" />
                  <h2 className="text-[13px] font-extrabold text-[#0F172A] uppercase tracking-wide">
                    Order Summary
                  </h2>
                </div>
                <span className="text-[11px] font-bold text-neutral-400">
                  {pricing.totalItemCount} {pricing.totalItemCount === 1 ? 'item' : 'items'}
                </span>
              </div>

              {/* Items List */}
              <div className="divide-y divide-neutral-100">
                {items.map((cartItem) => {
                  const { item, quantity, specialInstructions } = cartItem;
                  const lineTotal = item.price * quantity;
                  const isVeg = item.foodType === 'veg';

                  return (
                    <div key={item.id} className="py-2.5 first:pt-1 last:pb-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 min-w-0">
                          {/* Veg marker */}
                          <span
                            aria-label={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                            className={`w-3.5 h-3.5 rounded-xs border flex items-center justify-center shrink-0 mt-0.5 ${
                              isVeg
                                ? 'border-[#16A34A] text-[#16A34A]'
                                : 'border-[#DC2626] text-[#DC2626]'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isVeg ? 'bg-[#16A34A]' : 'bg-[#DC2626]'
                              }`}
                            />
                          </span>

                          <div>
                            <p className="text-[13px] font-extrabold text-[#0F172A] leading-snug">
                              {item.name}
                            </p>
                            <p className="text-[11.5px] text-neutral-500 font-medium">
                              ₹{item.price} × {quantity}
                            </p>
                          </div>
                        </div>

                        <span className="text-[13px] font-extrabold text-[#0F172A] tabular-nums shrink-0">
                          ₹{lineTotal}
                        </span>
                      </div>

                      {/* Preserved Cooking Note Display */}
                      {specialInstructions && (
                        <div className="mt-1.5 ml-5 bg-amber-50/70 border border-amber-200/60 rounded-lg px-2.5 py-1 text-[11px] text-amber-900 flex items-center gap-1.5">
                          <span className="font-bold text-amber-700">Note:</span>
                          <span className="truncate italic">&ldquo;{specialInstructions}&rdquo;</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Pricing Breakdown */}
              <div className="pt-2 border-t border-neutral-100 space-y-1.5 text-[12px] text-neutral-600">
                <div className="flex justify-between items-center">
                  <span>Item Subtotal</span>
                  <span className="font-bold text-[#0F172A] tabular-nums">
                    {formatINR(pricing.subtotal)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span>
                    {serviceMode === 'dinein'
                      ? 'Dine-in Packaging'
                      : serviceMode === 'takeaway'
                      ? 'Takeaway Packaging'
                      : 'Delivery Packaging'}
                  </span>
                  {pricing.packagingCharge === 0 ? (
                    <span className="font-bold text-[#16A34A] text-[11px] bg-emerald-50 px-1.5 py-0.5 rounded-md">
                      FREE
                    </span>
                  ) : (
                    <span className="font-bold text-[#0F172A] tabular-nums">
                      {formatINR(pricing.packagingCharge)}
                    </span>
                  )}
                </div>

                {serviceMode === 'delivery' && (
                  <div className="flex justify-between items-center">
                    <span>Campus Delivery Fee</span>
                    <span className="font-bold text-[#0F172A] tabular-nums">
                      {formatINR(pricing.deliveryFee)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span>GST (5%)</span>
                  <span className="font-bold text-[#0F172A] tabular-nums">
                    {formatINR(pricing.taxes)}
                  </span>
                </div>

                <div className="border-t border-dashed border-neutral-200 pt-2 mt-1 flex justify-between items-center">
                  <div>
                    <span className="text-[13.5px] font-black text-[#0F172A]">
                      Grand Total
                    </span>
                    <p className="text-[10px] text-neutral-400">
                      CGST Sec. 170 nearest-rupee rounded
                    </p>
                  </div>
                  <span className="text-[16px] font-black text-[#0F172A] tabular-nums">
                    {formatINR(pricing.grandTotal)}
                  </span>
                </div>
              </div>
            </section>

            {/* ============================================================= */}
            {/* C. CUSTOMER & SERVICE DETAILS                                 */}
            {/* ============================================================= */}
            <section
              aria-label="Customer Information"
              className="bg-white rounded-2xl p-4 border border-neutral-200/80 shadow-xs space-y-3.5"
            >
              <div className="flex items-center gap-1.5 pb-1 border-b border-neutral-100">
                <User className="w-4 h-4 text-neutral-600" />
                <h2 className="text-[13px] font-extrabold text-[#0F172A] uppercase tracking-wide">
                  {serviceMode === 'delivery' ? 'Delivery & Contact Details' : 'Customer Details'}
                </h2>
              </div>

              {/* Name & Phone Inputs */}
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="checkout-name"
                    className="block text-[11.5px] font-bold text-neutral-700 mb-1"
                  >
                    Customer Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="checkout-name"
                      type="text"
                      data-testid="checkout-customer-name"
                      value={customerName}
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        if (formErrors.customerName) {
                          setFormErrors((prev) => ({ ...prev, customerName: '' }));
                        }
                      }}
                      placeholder={operatorId === 'campora-cafe' ? 'e.g. Pratik Kumar' : 'e.g. Guest Customer'}
                      maxLength={60}
                      className={`w-full bg-neutral-50 border text-[13px] rounded-xl px-3 py-2 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:bg-white transition ${
                        formErrors.customerName
                          ? 'border-rose-400 focus:ring-1 focus:ring-rose-400'
                          : 'border-neutral-200 focus:ring-1 focus:ring-[#136B3C]'
                      }`}
                    />
                  </div>
                  {formErrors.customerName && (
                    <p className="text-[11px] text-rose-500 mt-1 font-medium">
                      {formErrors.customerName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="checkout-phone"
                    className="block text-[11.5px] font-bold text-neutral-700 mb-1"
                  >
                    Contact Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="checkout-phone"
                      type="tel"
                      data-testid="checkout-customer-phone"
                      value={customerPhone}
                      onChange={(e) => {
                        setCustomerPhone(e.target.value);
                        if (formErrors.customerPhone) {
                          setFormErrors((prev) => ({ ...prev, customerPhone: '' }));
                        }
                      }}
                      placeholder="e.g. +91 98765 43210"
                      maxLength={16}
                      className={`w-full bg-neutral-50 border text-[13px] rounded-xl px-3 py-2 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:bg-white transition ${
                        formErrors.customerPhone
                          ? 'border-rose-400 focus:ring-1 focus:ring-rose-400'
                          : 'border-neutral-200 focus:ring-1 focus:ring-[#136B3C]'
                      }`}
                    />
                  </div>
                  {formErrors.customerPhone && (
                    <p className="text-[11px] text-rose-500 mt-1 font-medium">
                      {formErrors.customerPhone}
                    </p>
                  )}
                </div>
              </div>

              {/* Service-Specific Details */}

              {/* 1. DINE-IN SERVICE DETAILS */}
              {serviceMode === 'dinein' && (
                <div className="pt-2 border-t border-neutral-100 space-y-3">
                  <div>
                    <label
                      htmlFor="checkout-table"
                      className="block text-[11.5px] font-bold text-neutral-700 mb-1"
                    >
                      Table or Seating Reference <span className="text-neutral-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      id="checkout-table"
                      type="text"
                      data-testid="checkout-table-number"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      placeholder="e.g. Table 4, Corner booth, or Counter seat"
                      maxLength={40}
                      className="w-full bg-neutral-50 border border-neutral-200 text-[13px] rounded-xl px-3 py-2 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#136B3C] focus:bg-white transition"
                    />
                    <p className="text-[10.5px] text-neutral-400 mt-1">
                      No reserved table needed. You can show your digital token to staff anytime.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="checkout-notes"
                      className="block text-[11.5px] font-bold text-neutral-700 mb-1"
                    >
                      Special Dining Request <span className="text-neutral-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      id="checkout-notes"
                      type="text"
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="e.g. Extra napkins, please serve together..."
                      maxLength={120}
                      className="w-full bg-neutral-50 border border-neutral-200 text-[13px] rounded-xl px-3 py-2 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#136B3C] focus:bg-white transition"
                    />
                  </div>
                </div>
              )}

              {/* 2. TAKEAWAY SERVICE DETAILS */}
              {serviceMode === 'takeaway' && (
                <div className="pt-2 border-t border-neutral-100 space-y-3">
                  <div>
                    <label
                      htmlFor="checkout-pickup-loc"
                      className="block text-[11.5px] font-bold text-neutral-700 mb-1"
                    >
                      Pickup Counter / Location <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="checkout-pickup-loc"
                      data-testid="checkout-pickup-location"
                      value={pickupLocation}
                      onChange={(e) => {
                        setPickupLocation(e.target.value);
                        if (formErrors.pickupLocation) {
                          setFormErrors((prev) => ({ ...prev, pickupLocation: '' }));
                        }
                      }}
                      className="w-full bg-neutral-50 border border-neutral-200 text-[13px] rounded-xl px-3 py-2 text-neutral-800 focus:outline-none focus:ring-1 focus:ring-[#136B3C] focus:bg-white transition"
                    >
                      {(config?.location?.pickupLocations || ['Main Pickup Counter']).map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10.5px] text-neutral-400 mt-1">
                      Immediate pickup upon preparation. Token displayed after confirmation.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="checkout-pickup-notes"
                      className="block text-[11.5px] font-bold text-neutral-700 mb-1"
                    >
                      Pickup Instructions <span className="text-neutral-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      id="checkout-pickup-notes"
                      type="text"
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="e.g. Pack in separate paper bag, include ketchup..."
                      maxLength={120}
                      className="w-full bg-neutral-50 border border-neutral-200 text-[13px] rounded-xl px-3 py-2 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#136B3C] focus:bg-white transition"
                    />
                  </div>
                </div>
              )}

              {/* 3. DELIVERY SERVICE DETAILS */}
              {serviceMode === 'delivery' && (
                <div className="pt-2 border-t border-neutral-100 space-y-3">
                  <span className="block text-[11.5px] font-bold text-neutral-700">
                    Delivery Address <span className="text-rose-500">*</span>
                  </span>

                  {/* Saved Address Cards */}
                  {savedAddresses.length > 0 && (
                    <div className="space-y-2">
                      {savedAddresses.map((addr) => {
                        const isSelected = selectedAddressId === addr.id;
                        return (
                          <div
                            key={addr.id}
                            onClick={() => {
                              setSelectedAddressId(addr.id);
                              if (formErrors.customBuilding || formErrors.customRoomLandmark) {
                                setFormErrors((prev) => ({
                                  ...prev,
                                  customBuilding: '',
                                  customRoomLandmark: '',
                                }));
                              }
                            }}
                            className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-2.5 ${
                              isSelected
                                ? 'bg-[#E0F2FE]/40 border-[#5BA8E6] shadow-xs'
                                : 'bg-neutral-50 border-neutral-200/80 hover:bg-neutral-100/50'
                            }`}
                          >
                            <input
                              type="radio"
                              name="delivery-address-selection"
                              checked={isSelected}
                              onChange={() => setSelectedAddressId(addr.id)}
                              className="mt-1 accent-[#0D528C]"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[12px] font-extrabold text-[#0F172A]">
                                  {addr.buildingOrGate}
                                </span>
                                <span className="text-[10px] font-bold bg-neutral-200/70 text-neutral-700 px-1.5 py-0.5 rounded-sm uppercase">
                                  {addr.label}
                                </span>
                              </div>
                              <p className="text-[11.5px] text-neutral-500 truncate mt-0.5">
                                {addr.roomOrLandmark}
                              </p>
                            </div>
                          </div>
                        );
                      })}

                      {/* Custom Address Radio Option */}
                      <div
                        onClick={() => setSelectedAddressId('custom')}
                        className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center gap-2.5 ${
                          selectedAddressId === 'custom'
                            ? 'bg-[#E0F2FE]/40 border-[#5BA8E6]'
                            : 'bg-neutral-50 border-neutral-200/80 hover:bg-neutral-100/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="delivery-address-selection"
                          checked={selectedAddressId === 'custom'}
                          onChange={() => setSelectedAddressId('custom')}
                          className="accent-[#0D528C]"
                        />
                        <span className="text-[12px] font-bold text-neutral-800">
                          Deliver to a different campus location
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Manual / New Address Entry Form */}
                  {selectedAddressId === 'custom' && (
                    <div className="bg-neutral-50/80 p-3 rounded-xl border border-neutral-200/80 space-y-2.5">
                      <div>
                        <label
                          htmlFor="custom-building"
                          className="block text-[11px] font-bold text-neutral-700 mb-1"
                        >
                          Building, Hostel, or Department <span className="text-rose-500">*</span>
                        </label>
                        <input
                          id="custom-building"
                          type="text"
                          data-testid="checkout-delivery-building"
                          value={customBuilding}
                          onChange={(e) => {
                            setCustomBuilding(e.target.value);
                            if (formErrors.customBuilding) {
                              setFormErrors((prev) => ({ ...prev, customBuilding: '' }));
                            }
                          }}
                          placeholder="e.g. Block C, Ramanujan Hostel"
                          maxLength={80}
                          className={`w-full bg-white border text-[12.5px] rounded-lg px-2.5 py-1.5 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#0D528C] transition ${
                            formErrors.customBuilding ? 'border-rose-400' : 'border-neutral-200'
                          }`}
                        />
                        {formErrors.customBuilding && (
                          <p className="text-[10.5px] text-rose-500 mt-0.5">
                            {formErrors.customBuilding}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="custom-room"
                          className="block text-[11px] font-bold text-neutral-700 mb-1"
                        >
                          Room, Floor, or Landmark <span className="text-rose-500">*</span>
                        </label>
                        <input
                          id="custom-room"
                          type="text"
                          data-testid="checkout-delivery-room"
                          value={customRoomLandmark}
                          onChange={(e) => {
                            setCustomRoomLandmark(e.target.value);
                            if (formErrors.customRoomLandmark) {
                              setFormErrors((prev) => ({ ...prev, customRoomLandmark: '' }));
                            }
                          }}
                          placeholder="e.g. Room 204, 2nd Floor"
                          maxLength={80}
                          className={`w-full bg-white border text-[12.5px] rounded-lg px-2.5 py-1.5 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#0D528C] transition ${
                            formErrors.customRoomLandmark ? 'border-rose-400' : 'border-neutral-200'
                          }`}
                        />
                        {formErrors.customRoomLandmark && (
                          <p className="text-[10.5px] text-rose-500 mt-0.5">
                            {formErrors.customRoomLandmark}
                          </p>
                        )}
                      </div>

                      <label className="flex items-center gap-2 pt-1 text-[11.5px] font-medium text-neutral-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={saveCustomAddress}
                          onChange={(e) => setSaveCustomAddress(e.target.checked)}
                          className="rounded text-[#0D528C] accent-[#0D528C]"
                        />
                        <span>Save this address to my profile address book</span>
                      </label>
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="checkout-delivery-instructions"
                      className="block text-[11.5px] font-bold text-neutral-700 mb-1"
                    >
                      Delivery Instructions <span className="text-neutral-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      id="checkout-delivery-instructions"
                      type="text"
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="e.g. Call upon arrival at hostel gate, leave with guard..."
                      maxLength={120}
                      className="w-full bg-neutral-50 border border-neutral-200 text-[13px] rounded-xl px-3 py-2 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#0D528C] focus:bg-white transition"
                    />
                  </div>
                </div>
              )}
            </section>

            {/* ============================================================= */}
            {/* D. DEMO PAYMENT PREFERENCE                                    */}
            {/* ============================================================= */}
            <section
              aria-label="Payment Preference"
              className="bg-white rounded-2xl p-4 border border-neutral-200/80 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between pb-1 border-b border-neutral-100">
                <div className="flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-neutral-600" />
                  <h2 className="text-[13px] font-extrabold text-[#0F172A] uppercase tracking-wide">
                    Payment Preference
                  </h2>
                </div>
                <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Demo Only
                </span>
              </div>

              {/* Clear Non-Monetary Safety Disclaimer */}
              <div className="bg-amber-50/80 border border-amber-200/70 rounded-xl p-2.5 flex items-start gap-2 text-amber-900 text-[11px] leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong className="font-bold">Stage 1 Evaluation:</strong> No real payment gateway is integrated. No live monetary transaction will occur.
                </p>
              </div>

              {/* Payment Methods Radios */}
              <div className="space-y-2 pt-1">
                {/* 1. Demo UPI */}
                <label
                  data-testid="checkout-payment-method-upi"
                  className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer ${
                    paymentMethod === 'demo_upi'
                      ? 'bg-[#E9FBF1]/50 border-[#136B3C] shadow-xs'
                      : 'bg-neutral-50 border-neutral-200/80 hover:bg-neutral-100/60'
                  }`}
                >
                  <input
                    type="radio"
                    name="demo-payment-option"
                    value="demo_upi"
                    checked={paymentMethod === 'demo_upi'}
                    onChange={() => setPaymentMethod('demo_upi')}
                    className="mt-1 accent-[#136B3C]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-extrabold text-[#0F172A]">
                        Simulated Demo UPI
                      </span>
                      <span className="text-[10px] font-bold bg-emerald-100 text-[#136B3C] px-1.5 py-0.5 rounded-sm uppercase">
                        Instant Mock
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Simulates immediate token generation without asking for banking credentials.
                    </p>
                  </div>
                </label>

                {/* 2. Cash at Counter / COD */}
                <label
                  data-testid="checkout-payment-method-cash"
                  className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer ${
                    paymentMethod === 'cash'
                      ? 'bg-[#E9FBF1]/50 border-[#136B3C] shadow-xs'
                      : 'bg-neutral-50 border-neutral-200/80 hover:bg-neutral-100/60'
                  }`}
                >
                  <input
                    type="radio"
                    name="demo-payment-option"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={() => setPaymentMethod('cash')}
                    className="mt-1 accent-[#136B3C]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-extrabold text-[#0F172A]">
                        {serviceMode === 'delivery' ? 'Cash on Delivery (Demo)' : 'Cash at Counter (Demo)'}
                      </span>
                      <span className="text-[10px] font-bold bg-neutral-200/80 text-neutral-700 px-1.5 py-0.5 rounded-sm uppercase">
                        Pay in Person
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      {serviceMode === 'delivery'
                        ? 'Simulated pay-on-arrival to delivery rider.'
                        : 'Simulated counter cash settlement upon order pickup.'}
                    </p>
                  </div>
                </label>

                {/* 3. Demo Campus Card / Meal Pass */}
                <label
                  data-testid="checkout-payment-method-card"
                  className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer ${
                    paymentMethod === 'campus_card'
                      ? 'bg-[#E9FBF1]/50 border-[#136B3C] shadow-xs'
                      : 'bg-neutral-50 border-neutral-200/80 hover:bg-neutral-100/60'
                  }`}
                >
                  <input
                    type="radio"
                    name="demo-payment-option"
                    value="campus_card"
                    checked={paymentMethod === 'campus_card'}
                    onChange={() => setPaymentMethod('campus_card')}
                    className="mt-1 accent-[#136B3C]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-extrabold text-[#0F172A]">
                        Campus Card / Meal Pass (Demo)
                      </span>
                      <span className="text-[10px] font-bold bg-neutral-200/80 text-neutral-700 px-1.5 py-0.5 rounded-sm uppercase">
                        Mock Wallet
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Simulated deduction from campus prepaid dining allowance.
                    </p>
                  </div>
                </label>
              </div>
            </section>
          </main>
        )}

        {/* ================================================================= */}
        {/* E. STICKY CONFIRMATION ACTION BAR                                 */}
        {/* ================================================================= */}
        {!isCartEmpty && (
          <aside
            aria-label="Checkout Confirmation"
            className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200/80 py-3 px-4 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
          >
            <div className="w-full max-w-[430px] mx-auto flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Grand Total
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span
                    data-testid="checkout-footer-total"
                    className="text-[18px] font-black text-[#0F172A] tabular-nums leading-none"
                  >
                    {formatINR(pricing.grandTotal)}
                  </span>
                  <span className="text-[11px] font-semibold text-neutral-500">
                    ({pricing.totalItemCount} {pricing.totalItemCount === 1 ? 'item' : 'items'})
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleConfirmOrder()}
                disabled={isSubmitting}
                data-testid="checkout-confirm-btn"
                className="py-3 px-6 rounded-2xl bg-[#F05360] hover:bg-[#E14552] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white font-extrabold text-[13.5px] shadow-[0_4px_14px_rgba(240,83,96,0.35)] transition flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Placing Order...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Mock Order</span>
                  </>
                )}
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
