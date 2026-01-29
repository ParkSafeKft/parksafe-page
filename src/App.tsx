import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect, Suspense, lazy } from "react";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { LanguageProvider } from "./contexts/LanguageContext.tsx";
import Header from "./Header.tsx";
import Footer from "./Footer.tsx";
import HomePage from "./HomePage.tsx"; // Keep Home eager loaded for LCP
import ScrollToTop from "./components/ScrollToTop";

// Lazy load other pages to reduce bundle size
const Contact = lazy(() => import("./Contact.tsx"));
const Terms = lazy(() => import("./Terms.tsx"));
const Privacy = lazy(() => import("./Privacy.tsx"));
const Success = lazy(() => import("./Success.tsx"));
const Error = lazy(() => import("./Error.tsx"));
const EmailChangeSuccess = lazy(() => import("./EmailChangeSuccess.tsx"));
const PasswordReset = lazy(() => import("./PasswordReset.tsx"));
const Login = lazy(() => import("./Login.tsx"));
const Profile = lazy(() => import("./Profile.tsx"));
const Admin = lazy(() => import("./admin/modern.tsx"));
const Test = lazy(() => import("./Test.tsx"));
const NotFound = lazy(() => import("./NotFound.tsx"));

// Loading component for Suspense
const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-[#34aa56] border-t-transparent rounded-full animate-spin" />
  </div>
);

// Component to handle OAuth redirects
function AuthRedirectHandler() {

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const hash = location.hash;

    // Check if this is a password recovery/reset
    if (hash.includes('type=recovery')) {
      setTimeout(() => {
        navigate('/password-reset', { replace: true });
      }, 100);
      return;
    }

    // Check if we have auth tokens in the URL hash (regular login)
    if (hash && hash.includes('access_token=')) {
      // Clear the hash from URL and let Supabase auth state listener handle it
      // The AuthContext will pick up the session change
      setTimeout(() => {
        // Give Supabase a moment to process the tokens
        navigate('/profile', { replace: true });
      }, 1000);
    }
  }, [location, navigate]);

  return null;
}

// Layout wrapper component
function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  if (isAdminPage) {
    return children;
  }

  return (
    <div className="app">
      <Header />
      <main className="main-content">{children}</main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <AuthRedirectHandler />
          <ScrollToTop />
          <AppLayout>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/success" element={<Success />} />
                <Route path="/error" element={<Error />} />
                <Route path="/email-change-success" element={<EmailChangeSuccess />} />
                <Route path="/password-reset" element={<PasswordReset />} />
                <Route path="/login" element={<Login />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/test" element={<Test />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AppLayout>

        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;
