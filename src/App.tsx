import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CanteenProvider } from './context/CanteenContext.tsx';
import { CanteenMetadataSync } from './components/CanteenMetadataSync.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { OrderProvider } from './context/OrderContext.tsx';
import { CustomerNavigationShell } from './components/CustomerNavigationShell.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { OrdersPage } from './pages/OrdersPage.tsx';
import { OrderDetailPage } from './pages/OrderDetailPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { CartPage } from './pages/CartPage.tsx';
import { CheckoutPage } from './pages/CheckoutPage.tsx';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage.tsx';
import { PlaceholderPage } from './pages/PlaceholderPage.tsx';
import { AccountPrivacyPage } from './pages/AccountPrivacyPage.tsx';
import { AboutCanteenPage } from './pages/AboutCanteenPage.tsx';
import { AboutOpenCanteenPage } from './pages/AboutOpenCanteenPage.tsx';
import { LegalPoliciesPage } from './pages/LegalPoliciesPage.tsx';
import { PolicyDetailPage } from './pages/PolicyDetailPage.tsx';

export default function App() {
  return (
    <BrowserRouter>
      <CanteenProvider>
        <CanteenMetadataSync />
        <AuthProvider>
          <CartProvider>
            <OrderProvider>
              <Routes>
              {/* Coordinated spatial navigation shell across Home, Orders, Profile, and other screens */}
              <Route element={<CustomerNavigationShell />}>
                {/* Home Page (Approved and Design-Locked) */}
                <Route path="/" element={<HomePage hideBottomNav />} />

                {/* Phase 2: Order History Page (With Orders & Empty State) + Order Details */}
                <Route path="/orders" element={<OrdersPage hideBottomNav />} />
                <Route path="/orders/:id" element={<OrderDetailPage hideBottomNav />} />

                {/* Phase 3: Approved Profile Page (Rendered within spatial transition stage) */}
                <Route path="/profile" element={<ProfilePage hideFloatingHomePill />} />

              {/* Minimal Functional Placeholders for Pending Screens */}
              <Route
                path="/product/:id"
                element={<PlaceholderPage title="Product Details" description="Detailed ingredients, nutrition, and customizations view." />}
              />
              <Route
                path="/cart"
                element={<CartPage />}
              />
              <Route
                path="/checkout"
                element={<CheckoutPage />}
              />
              <Route
                path="/order-confirmation/:id"
                element={<OrderConfirmationPage />}
              />
              <Route
                path="/login"
                element={<PlaceholderPage title="Login" description="Firebase authentication login screen." />}
              />
              <Route
                path="/signup"
                element={<PlaceholderPage title="Signup" description="Customer registration screen." />}
              />
              <Route
                path="/forgot-password"
                element={<PlaceholderPage title="Password Reset" description="Reset password via email link." />}
              />
              <Route
                path="/addresses"
                element={<Navigate to="/profile?sheet=addressBook" replace />}
              />
              <Route
                path="/settings"
                element={<Navigate to="/profile?sheet=appearance" replace />}
              />
              <Route
                path="/privacy"
                element={<AccountPrivacyPage />}
              />
              <Route
                path="/account-privacy"
                element={<Navigate to="/privacy" replace />}
              />
              <Route
                path="/profile/about-canteen"
                element={<AboutCanteenPage />}
              />
              <Route
                path="/about-canteen"
                element={<Navigate to="/profile/about-canteen" replace />}
              />
              <Route
                path="/profile/about-open-canteen"
                element={<AboutOpenCanteenPage />}
              />
              <Route
                path="/about-open-canteen"
                element={<Navigate to="/profile/about-open-canteen" replace />}
              />
              <Route
                path="/profile/legal"
                element={<LegalPoliciesPage />}
              />
              <Route
                path="/profile/legal/:policyId"
                element={<PolicyDetailPage />}
              />
              <Route
                path="/legal"
                element={<Navigate to="/profile/legal" replace />}
              />
              <Route
                path="*"
                element={<PlaceholderPage title="Page Not Found" description="The requested screen does not exist." />}
              />
            </Route>
          </Routes>
          </OrderProvider>
        </CartProvider>
      </AuthProvider>
    </CanteenProvider>
  </BrowserRouter>
);
}
