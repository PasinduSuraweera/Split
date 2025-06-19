import React from 'react';

function Home() {
  return (
    <>
      <div className="relative z-10">
        <h1 className="text-6xl md:text-7xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] mb-4 animate-pulse-slow" role="heading" aria-level="1">
          Split
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
            className="inline-block bg-[var(--color-primary)]/80 backdrop-blur-sm text-white px-6 py-3 rounded-xl shadow-md hover:bg-[var(--color-secondary)]/80 hover:scale-105 transition-all duration-300 animate-fade-in-delay-2"
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
    </>
  );
}

export default Home;