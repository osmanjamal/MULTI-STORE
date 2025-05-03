import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white shadow-inner p-4 mt-8">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="mb-2 md:mb-0">
          <p className="text-sm text-gray-600">
            جميع الحقوق محفوظة &copy; {currentYear} - نظام مزامنة المتاجر المتعددة
          </p>
        </div>
        <div className="flex items-center space-x-4 space-x-reverse">
          
            href="/docs"
            className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            التوثيق
          </a>
          
            href="/support"
            className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            الدعم الفني
          </a>
          
            href="/privacy"
            className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            سياسة الخصوصية
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;