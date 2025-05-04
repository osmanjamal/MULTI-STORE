import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 border-t border-gray-200">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold text-gray-800">مخزن متعدد المتاجر</h3>
            <p className="text-sm text-gray-600 mt-1">حل شامل لإدارة متاجرك الإلكترونية</p>
          </div>
          
          <div className="flex gap-8">
            <a 
              href="/docs" 
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              التوثيق
            </a>
            <a 
              href="/support" 
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              الدعم
            </a>
            <a 
              href="/privacy" 
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              سياسة الخصوصية
            </a>
            <a 
              href="/terms" 
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              شروط الاستخدام
            </a>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>© {currentYear} جميع الحقوق محفوظة</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;