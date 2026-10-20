import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { OrderProvider } from './context/OrderContext.tsx';
import { CustomerNavigationShell } from './components/CustomerNavigationShell.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { OrdersPage } from './pages/OrdersPage.tsx';
import { OrderDetailPage } from './pages/OrderDetailPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { PlaceholderPage } from './pages/PlaceholderPage.tsx';

export default function App() {
  return (
    <BrowserRouter>
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
                <Route path="/orders/:id" element={<OrderDetailPage />} />

                {/* Phase 3: Approved Profile Page (Rendered within spatial transition stage) */}
                <Route path="/profile" element={<ProfilePage hideFloatingHomePill />} />

              {/* Minimal Functional Placeholders for Pending Screens */}
              <Route
                path="/product/:id"
                element={<PlaceholderPage title="Product Details" description="Detailed ingredients, nutrition, and customizations view." />}
              />
              <Route
                path="/cart"
                element={<PlaceholderPage title="Cart" description="Approved cart design will be built when reference image is provided." />}
              />
              <Route
                path="/checkout"
                element={<PlaceholderPage title="Checkout" description="Delivery/table details and payment gateway integration." />}
              />
              <Route
                path="/order-confirmation/:id"
                element={<PlaceholderPage title="Order Confirmation" description="Token slip and estimated preparation time." />}
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
                element={<PlaceholderPage title="Saved Addresses" description="Hostel, campus, and room delivery addresses." />}
              />
              <Route
                path="/settings"
                element={<PlaceholderPage title="Settings" description="PWA, notifications, and application settings." />}
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
    </BrowserRouter>
  );
}
