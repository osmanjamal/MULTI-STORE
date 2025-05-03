import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        
        <main className="flex-1 overflow-y-auto pt-6 px-4 pb-4 md:px-6 lg:px-8">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      <Footer />
      
      {/* زر فتح القائمة الجانبية في وضع المحمول */}
      <button
        className="md:hidden fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg focus:outline-none"
        onClick={() => setSidebarOpen(true)}
      >
        <svg
          className="h-6 w-6"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16m-7 6h7"
          />
        </svg>
      </button>
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired
};

export default Layout;