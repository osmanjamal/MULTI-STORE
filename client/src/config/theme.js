/**
 * تكوين السمة الرئيسية للتطبيق
 * يحدد هذا الملف الألوان والخطوط وقيم التصميم الأخرى المستخدمة في التطبيق
 */

const theme = {
    // نظام الألوان
    colors: {
      // الألوان الأساسية
      primary: {
        main: '#2563EB',      // أزرق
        light: '#60A5FA',
        dark: '#1E40AF',
        contrastText: '#FFFFFF'
      },
      secondary: {
        main: '#10B981',      // أخضر
        light: '#34D399',
        dark: '#059669',
        contrastText: '#FFFFFF'
      },
      error: {
        main: '#EF4444',      // أحمر
        light: '#F87171',
        dark: '#B91C1C',
        contrastText: '#FFFFFF'
      },
      warning: {
        main: '#F59E0B',      // برتقالي
        light: '#FBBF24',
        dark: '#D97706',
        contrastText: '#FFFFFF'
      },
      info: {
        main: '#3B82F6',      // أزرق فاتح
        light: '#60A5FA',
        dark: '#2563EB',
        contrastText: '#FFFFFF'
      },
      success: {
        main: '#10B981',      // أخضر
        light: '#34D399',
        dark: '#059669',
        contrastText: '#FFFFFF'
      },
      
      // ألوان محايدة
      neutral: {
        main: '#6B7280',      // رمادي
        light: '#D1D5DB',
        dark: '#374151',
        contrastText: '#FFFFFF'
      },
      
      // ألوان الخلفية والنص
      background: {
        default: '#F9FAFB',   // رمادي فاتح جداً
        paper: '#FFFFFF',
        sidebar: '#111827',   // رمادي داكن
        card: '#FFFFFF'
      },
      text: {
        primary: '#111827',   // رمادي داكن
        secondary: '#4B5563', // رمادي
        disabled: '#9CA3AF',  // رمادي فاتح
        hint: '#6B7280'       // رمادي
      },
      
      // ألوان المنصات
      platforms: {
        shopify: '#5E8E3E',   // أخضر شوبيفاي
        woocommerce: '#96588A', // أرجواني ووكومرس
        lazada: '#F57224',    // برتقالي لازادا
        shopee: '#EE4D2D',    // أحمر شوبي
      },
      
      // ألوان الحالات
      status: {
        active: '#10B981',    // أخضر
        inactive: '#9CA3AF',  // رمادي
        pending: '#F59E0B',   // برتقالي
        failed: '#EF4444',    // أحمر
        processing: '#3B82F6', // أزرق
        completed: '#10B981'  // أخضر
      },
      
      // ألوان المخطط
      chart: [
        '#3B82F6', // أزرق
        '#10B981', // أخضر
        '#F59E0B', // برتقالي
        '#EF4444', // أحمر
        '#8B5CF6', // أرجواني
        '#EC4899', // وردي
        '#14B8A6', // فيروزي
        '#F97316', // برتقالي داكن
        '#06B6D4', // سماوي
        '#6366F1'  // أزرق داكن
      ]
    },
    
    // نظام الخطوط
    typography: {
      fontFamily: "'Cairo', 'Tajawal', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      fontWeightLight: 300,
      fontWeightRegular: 400,
      fontWeightMedium: 500,
      fontWeightBold: 700,
      fontWeightExtraBold: 800,
      fontSize: 16,
      lineHeight: 1.5,
      
      // أحجام الخطوط
      h1: {
        fontSize: '2.5rem',
        fontWeight: 700,
        lineHeight: 1.2
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 700,
        lineHeight: 1.2
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
        lineHeight: 1.3
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.3
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 500,
        lineHeight: 1.4
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 500,
        lineHeight: 1.4
      },
      subtitle1: {
        fontSize: '1.125rem',
        fontWeight: 400,
        lineHeight: 1.5
      },
      subtitle2: {
        fontSize: '0.875rem',
        fontWeight: 500,
        lineHeight: 1.5
      },
      body1: {
        fontSize: '1rem',
        fontWeight: 400,
        lineHeight: 1.5
      },
      body2: {
        fontSize: '0.875rem',
        fontWeight: 400,
        lineHeight: 1.5
      },
      button: {
        fontSize: '0.875rem',
        fontWeight: 500,
        lineHeight: 1.5,
        textTransform: 'none'
      },
      caption: {
        fontSize: '0.75rem',
        fontWeight: 400,
        lineHeight: 1.5
      },
      overline: {
        fontSize: '0.75rem',
        fontWeight: 500,
        lineHeight: 1.5,
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }
    },
    
    // المسافات والحدود
    shape: {
      borderRadius: 8,
      borderWidth: 1,
      spacing: 8,
    },
    
    // الظلال
    shadows: [
      'none',
      '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
    ],
    
    // التحولات
    transitions: {
      easing: {
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        sharp: 'cubic-bezier(0.4, 0, 0.6, 1)'
      },
      duration: {
        shortest: 150,
        shorter: 200,
        short: 250,
        standard: 300,
        complex: 375,
        enteringScreen: 225,
        leavingScreen: 195
      }
    },
    
    // وسائط الاستجابة (Breakpoints)
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1920
      }
    },
    
    // كتابة من اليمين لليسار
    direction: 'rtl',
    
    // إعدادات المكونات
    components: {
      // أزرار
      button: {
        // أحجام الأزرار
        sizes: {
          small: {
            padding: '0.25rem 0.5rem',
            fontSize: '0.75rem'
          },
          medium: {
            padding: '0.5rem 1rem',
            fontSize: '0.875rem'
          },
          large: {
            padding: '0.75rem 1.5rem',
            fontSize: '1rem'
          }
        },
        // أنواع الأزرار
        variants: {
          contained: {
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
          },
          outlined: {
            border: '1px solid'
          },
          text: {
            padding: '0.5rem 0.75rem'
          }
        }
      },
      
      // بطاقات
      card: {
        padding: '1rem',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
      },
      
      // حقول الإدخال
      input: {
        borderRadius: '0.375rem',
        borderWidth: '1px',
        padding: '0.5rem 0.75rem',
        fontSize: '0.875rem',
        height: '2.5rem'
      },
      
      // جداول
      table: {
        headerBgColor: '#F3F4F6',
        borderColor: '#E5E7EB',
        hoverColor: '#F9FAFB',
        stripedColor: '#F3F4F6'
      },
      
      // تبويبات
      tabs: {
        indicatorSize: '2px',
        padding: '0.5rem 1rem'
      }
    },
    
    // إعدادات مخصصة
    custom: {
      sidebar: {
        width: 280,
        collapsedWidth: 80
      },
      header: {
        height: 64
      },
      footer: {
        height: 48
      },
      container: {
        maxWidth: 1200,
        padding: '1rem'
      }
    }
  };
  
  // وظائف مساعدة للسمة
  export const getColor = (colorKey, variant = 'main') => {
    const keys = colorKey.split('.');
    let color = theme.colors;
    
    for (const key of keys) {
      color = color[key];
      if (!color) return null;
    }
    
    return typeof color === 'object' ? color[variant] : color;
  };
  
  export const getSpacing = (multiplier = 1) => {
    return `${theme.shape.spacing * multiplier}px`;
  };
  
  export const getBreakpoint = (key) => {
    return theme.breakpoints.values[key];
  };
  
  export const mediaQuery = (key) => {
    return `@media (min-width: ${theme.breakpoints.values[key]}px)`;
  };
  
  export default theme;