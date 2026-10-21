import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '../components/Header.tsx';
import { BottomNavigation } from '../components/BottomNavigation.tsx';
import { OrderCard } from '../components/OrderCard.tsx';
import { OrderHistorySkeleton } from '../components/skeleton/OrderHistorySkeleton.tsx';
import { usePageReadiness } from '../hooks/usePageReadiness.ts';
import { useOrders } from '../context/OrderContext.tsx';
import {
  filterOrdersByTab,
  getOrderTabCounts,
  formatOrderTabLabel,
  type OrderHistoryTab,
} from '../utils/orderHistory.ts';

interface OrdersPageProps {
  hideBottomNav?: boolean;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ hideBottomNav = false }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { orders, loadingOrders } = useOrders();
  const { isReady, showSkeleton } = usePageReadiness({
    pageKey: 'orders',
    isDataReady: !loadingOrders,
  });
  const [activeTab, setActiveTab] = useState<OrderHistoryTab>('all');

  // Support explicit ?empty=1 or ?state=empty preview parameter as well as actual empty orders array
  const forceEmpty =
    searchParams.get('empty') === '1' ||
    searchParams.get('empty') === 'true' ||
    searchParams.get('state') === 'empty';

  const toggleEmptyStatePreview = () => {
    if (forceEmpty) {
      setSearchParams({});
    } else {
      setSearchParams({ empty: '1' });
    }
  };

  const effectiveOrders = forceEmpty ? [] : orders;
  const { allCount, cancelledCount } = getOrderTabCounts(effectiveOrders);
  const displayedOrders = filterOrdersByTab(effectiveOrders, activeTab);
  const isEmptyState = displayedOrders.length === 0;

  if (showSkeleton || (loadingOrders && !isReady)) {
    return (
      <div className="min-h-screen bg-[#FCFCFC] text-neutral-900 pb-24 select-none flex flex-col items-center">
        <div className="w-full max-w-[430px] min-h-screen bg-[#FCFCFC] relative shadow-sm flex flex-col">
          <OrderHistorySkeleton />
          {!hideBottomNav && <BottomNavigation />}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFCFC] text-neutral-900 pb-24 select-none flex flex-col items-center transition-opacity duration-200">
      <div className="w-full max-w-[430px] min-h-screen bg-[#FCFCFC] relative shadow-sm flex flex-col">
        {/* 1. BRANDED HEADER */}
        <Header />

        {/* 2. "MY ORDERS" MINT HERO BANNER */}
        <section
          aria-label="My Orders Banner"
          className="mx-3 mt-1 rounded-[16px] bg-[#E9FBF1] pl-3 pr-1.5 py-2 flex items-center justify-between relative overflow-hidden min-h-[62px]"
        >
          <div className="flex items-center gap-2.5 z-10 min-w-0">
            <button
              type="button"
              onClick={toggleEmptyStatePreview}
              aria-label="Toggle empty orders state preview"
              title="Tap to toggle between Orders List and Empty Orders view"
              className="shrink-0 cursor-pointer focus:outline-none"
            >
              <img
                src="/assets/orders/banner-clipboard-icon.png"
                alt="Orders checklist"
                referrerPolicy="no-referrer"
                className="w-[40px] h-[42px] object-contain"
              />
            </button>
            <div className="min-w-0">
              <h1 className="text-[17.5px] font-extrabold text-[#111827] leading-tight tracking-tight">
                My Orders
              </h1>
              <p className="text-[10.5px] font-medium text-[#64748B] mt-0.5 whitespace-nowrap">
                Track your orders and enjoy your food
              </p>
            </div>
          </div>

          <img
            src="/assets/orders/banner-bag-art.png"
            alt="Takeaway cup and paper bag"
            referrerPolicy="no-referrer"
            className="h-[56px] w-auto object-contain shrink-0 -my-1 select-none pointer-events-none"
          />
        </section>

        {/* 3. SEGMENTED TABS BAR: All Orders / Cancelled */}
        <div
          role="tablist"
          aria-label="Order Filter Tabs"
          className="mx-3 mt-2.5 bg-white rounded-full p-1 shadow-[0_2px_12px_rgba(0,0,0,0.05)] border border-neutral-100/90 grid grid-cols-2 relative"
        >
          {/* Left Tab: All Orders */}
          <button
            role="tab"
            aria-selected={activeTab === 'all'}
            onClick={() => setActiveTab('all')}
            className={`relative flex items-center justify-center gap-2 py-2 px-3 rounded-full text-[12.5px] font-bold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#E8FBF1] text-[#0B8A44]'
                : 'bg-transparent text-[#64748B] hover:text-[#334155]'
            }`}
          >
            {/* Green Shopping Bag Icon with Smile */}
            <svg viewBox="0 0 20 20" className="w-[16px] h-[16px] shrink-0" fill="none">
              <path
                d="M7 6V5C7 3.34 8.34 2 10 2s3 1.34 3 3v1"
                stroke={activeTab === 'all' ? '#0B8A44' : '#64748B'}
                strokeWidth="1.7"
                strokeLinecap="round"
              />
              <rect
                x="3.5"
                y="6"
                width="13"
                height="11.5"
                rx="2.4"
                stroke={activeTab === 'all' ? '#0B8A44' : '#64748B'}
                strokeWidth="1.7"
              />
              <path
                d="M7.5 10.2c.5 1 1.4 1.6 2.5 1.6s2-.6 2.5-1.6"
                stroke={activeTab === 'all' ? '#0B8A44' : '#64748B'}
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
            <span>{formatOrderTabLabel('all', allCount, cancelledCount)}</span>

            {/* Bottom Active Green Indicator Line */}
            {activeTab === 'all' && (
              <span className="absolute -bottom-1 left-5 right-5 h-[2.5px] bg-[#0B8A44] rounded-full" />
            )}
          </button>

          {/* Right Tab: Cancelled */}
          <button
            role="tab"
            aria-selected={activeTab === 'cancelled'}
            onClick={() => setActiveTab('cancelled')}
            className={`relative flex items-center justify-center gap-2 py-2 px-3 rounded-full text-[12.5px] font-bold transition-all cursor-pointer ${
              activeTab === 'cancelled'
                ? 'bg-[#E8FBF1] text-[#0B8A44]'
                : 'bg-transparent text-[#64748B] hover:text-[#334155]'
            }`}
          >
            {/* Circle X Icon */}
            <svg viewBox="0 0 20 20" className="w-[16px] h-[16px] shrink-0" fill="none">
              <circle
                cx="10"
                cy="10"
                r="7.8"
                stroke={activeTab === 'cancelled' ? '#0B8A44' : '#334155'}
                strokeWidth="1.7"
              />
              <path
                d="M7.5 7.5l5 5M12.5 7.5l-5 5"
                stroke={activeTab === 'cancelled' ? '#0B8A44' : '#334155'}
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
            <span>{formatOrderTabLabel('cancelled', allCount, cancelledCount)}</span>

            {activeTab === 'cancelled' && (
              <span className="absolute -bottom-1 left-5 right-5 h-[2.5px] bg-[#0B8A44] rounded-full" />
            )}
          </button>
        </div>

        {/* 4. MAIN CONTENT: ORDER CARDS LIST (IMAGE 1) OR EMPTY STATE (IMAGE 2) */}
        <main className="flex-1 flex flex-col px-3 pt-2.5 pb-4">
          {!isEmptyState ? (
            <div className="flex flex-col gap-2">
              {displayedOrders.map((order) => (
                <OrderCard
                  key={order.orderId}
                  order={order}
                  onSelectOrder={(id) => navigate(`/orders/${id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-4">
              {/* Approved Empty State Illustration */}
              <img
                src="/assets/orders/empty-orders-illustration.png"
                alt="No Orders Yet Illustration"
                referrerPolicy="no-referrer"
                className="w-[260px] h-auto object-contain mx-auto select-none"
              />

              <h2 className="text-[21px] font-extrabold text-[#111827] mt-3 tracking-tight">
                {activeTab === 'cancelled' && effectiveOrders.length > 0
                  ? 'No Cancelled Orders'
                  : 'No Orders Yet!'}
              </h2>

              <p className="text-[13px] font-medium text-[#64748B] mt-2 max-w-[265px] mx-auto leading-[1.48]">
                {activeTab === 'cancelled' && effectiveOrders.length > 0
                  ? 'You do not have any cancelled orders. All your orders are currently active or completed.'
                  : 'You haven’t placed any orders yet. Browse our delicious menu and place your first order now.'}
              </p>

              {/* Action CTA Pill */}
              {activeTab === 'cancelled' && effectiveOrders.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className="mt-5 bg-[#08914D] hover:bg-[#067A40] active:scale-[0.98] text-white font-bold text-[14.5px] px-8 py-3 rounded-full shadow-[0_4px_14px_rgba(8,145,77,0.25)] inline-flex items-center justify-center gap-2.5 transition-all cursor-pointer min-w-[195px]"
                >
                  <span>View All Orders</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="mt-5 bg-[#08914D] hover:bg-[#067A40] active:scale-[0.98] text-white font-bold text-[14.5px] px-8 py-3 rounded-full shadow-[0_4px_14px_rgba(8,145,77,0.25)] inline-flex items-center justify-center gap-2.5 transition-all cursor-pointer min-w-[195px]"
                >
                  {/* Fork & Spoon White Icon */}
                  <svg viewBox="0 0 20 20" className="w-[18px] h-[18px] shrink-0" fill="#FFFFFF">
                    <path d="M4.5 2.5c-.4 0-.7.3-.7.7v4.3c0 1.1.7 2 1.7 2.3v7.2c0 .6.4 1 1 1s1-.4 1-1V9.8c1-.3 1.7-1.2 1.7-2.3V3.2c0-.4-.3-.7-.7-.7s-.7.3-.7.7v3.3h-.6V3.2c0-.4-.3-.7-.7-.7s-.7.3-.7.7v3.3h-.6V3.2c0-.4-.3-.7-.7-.7z" />
                    <path d="M13.8 2.5c-1.5 0-2.7 1.5-2.7 3.4 0 1.5.8 2.8 1.8 3.2v7.9c0 .6.4 1 1 1s1-.4 1-1V9.1c1-.4 1.8-1.7 1.8-3.2 0-1.9-1.2-3.4-2.9-3.4z" />
                  </svg>
                  <span>Explore Menu</span>
                </button>
              )}
            </div>
          )}
        </main>

        {/* 5. BOTTOM NAVIGATION */}
        {!hideBottomNav && <BottomNavigation />}
      </div>
    </div>
  );
};
