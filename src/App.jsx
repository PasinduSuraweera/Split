import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { FaChartBar, FaMoneyBillWave, FaChartLine } from 'react-icons/fa';
import { FaTwitter, FaFacebook, FaInstagram, FaEnvelope } from 'react-icons/fa';

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white font-sans overflow-hidden relative">
      {/* Modern Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-gray-900/80 backdrop-blur-sm py-4 px-6 flex justify-between items-center transition-all duration-300">
        <Link to="/" className="text-3xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text" aria-label="Home">
          Sp/it
        </Link>
        <nav className="hidden md:flex space-x-6">
          <Link to="/" className="hover:text-[var(--color-primary)] transition-colors duration-300" aria-label="Home section">Home</Link>
          <a href="#features" className="hover:text-[var(--color-primary)] transition-colors duration-300" aria-label="Features section">Features</a>
          <a href="#contact" className="hover:text-[var(--color-primary)] transition-colors duration-300" aria-label="Contact section">Contact</a>
        </nav>
        <Link
          to="/signin"
          className="hidden md:inline-block bg-[var(--color-secondary)]/80 text-white px-5 py-2 rounded-lg shadow-md hover:bg-[var(--color-primary)]/80 hover:scale-105 transition-all duration-300"
          aria-label="Get Started"
        >
          Get Started
        </Link>
        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-2xl focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 right-6 bg-gray-900/90 backdrop-blur-sm p-4 rounded-lg shadow-lg space-y-4">
            <Link to="/" className="block hover:text-[var(--color-primary)] transition-colors duration-300" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
            <a href="#features" className="block hover:text-[var(--color-primary)] transition-colors duration-300" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
            <a href="#contact" className="block hover:text-[var(--color-primary)] transition-colors duration-300" onClick={() => setIsMobileMenuOpen(false)}>Contact</a>
            <Link
              to="/signin"
              className="block bg-[var(--color-secondary)]/80 text-white px-4 py-2 rounded-lg hover:bg-[var(--color-primary)]/80 transition-all duration-300 text-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Get Start
            </Link>
          </div>
        )}
      </header>

      {/* Main Content with Padding for Fixed Header */}
      <main className="pt-40">
        {/* Hero Section */}
        <section id="home" className="px-4 text-center relative">
          <div className="relative z-10">
            <h1 className="text-6xl md:text-7xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] mb-4 animate-pulse-slow" role="heading" aria-level="1">
              Sp/it
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-6 max-w-2xl mx-auto animate-fade-in" role="doc-subtitle">
              Intelligent Bill Splitting Redefined
            </p>
            <p className="text-sm md:text-base text-gray-500 mb-8 max-w-prose mx-auto animate-fade-in-delay">
              Streamline group expenses, settle debts effortlessly, and gain insights with a cutting-edge financial tool.
            </p>
            <div className="space-x-4">
              <a
                href="/signin"
                className="inline-block bg-[var(--color-secondary)]/80 backdrop-blur-sm text-white px-6 py-3 rounded-xl shadow-md hover:bg-[var(--color-primary)]/80 hover:scale-105 transition-all duration-300 animate-fade-in-delay-2"
                aria-label="Get Started"
              >
                Get Started
              </a>
              <a
                href="/signup"
                className="inline-block bg-gray-800/50 backdrop-blur-sm text-gray-200 px-6 py-3 rounded-xl shadow-md hover:bg-gray-700/50 hover:scale-105 transition-all duration-300 animate-fade-in-delay-3"
                aria-label="Learn More"
              >
                Learn More
              </a>
            </div>
          </div>
          {/* Add Outlet here to render SignIn/SignUp over the hero section when navigated */}
          <Outlet />
        </section>

        {/* Features Section */}
        <section id="features" className="py-18 px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="p-6 bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center group" role="region" aria-label="Easy Tracking Feature">
              <FaChartBar className="text-4xl text-[var(--color-primary)] mb-4" />
              <h3 className="text-xl font-semibold mb-2">Easy Tracking</h3>
              <p className="text-gray-500 text-center">Seamlessly log and split bills with a user-friendly design.</p>
            </div>
            <div className="p-6 bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center group" role="region" aria-label="Smart Settlements Feature">
              <FaMoneyBillWave className="text-4xl text-[var(--color-secondary)] mb-4" />
              <h3 className="text-xl font-semibold mb-2">Smart Settlements</h3>
              <p className="text-gray-500 text-center">Automate debt calculations for hassle-free resolutions.</p>
            </div>
            <div className="p-6 bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center group" role="region" aria-label="Insightful Stats Feature">
              <FaChartLine className="text-4xl text-gray-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Insightful Stats</h3>
              <p className="text-gray-500 text-center">Explore detailed visuals of your financial patterns.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Modern Footer */}
      <footer className="bg-gray-900 pb-5 py-3 px-4 text-center border-t border-gray-800">
        <p className="text-center text-gray-500 mt-4">© {new Date().getFullYear()} Split. All rights reserved.</p>
      </footer>
    </div>
  );
}

// Animation keyframes
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes fadeInDelay {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulseSlow {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }
  .animate-fade-in { animation: fadeIn 1s ease-out; }
  .animate-fade-in-delay { animation: fadeInDelay 1s ease-out 0.2s backwards; }
  .animate-fade-in-delay-2 { animation: fadeInDelay 1s ease-out 0.4s backwards; }
  .animate-fade-in-delay-3 { animation: fadeInDelay 1s ease-out 0.6s backwards; }
  .animate-pulse-slow { animation: pulseSlow 3s infinite; }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

export default App;