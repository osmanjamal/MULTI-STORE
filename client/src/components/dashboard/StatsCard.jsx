import React from 'react';
import PropTypes from 'prop-types';
import Card from '../common/Card';

const StatsCard = ({ title, value, description, change, icon, className, loading }) => {
  // دالة لتحديد لون التغيير
  const getChangeColor = () => {
    if (!change) return 'text-gray-500';
    return parseFloat(change) >= 0 ? 'text-green-500' : 'text-red-500';
  };

  // دالة لتحديد أيقونة السهم بناءً على التغيير
  const getChangeIcon = () => {
    if (!change) return null;
    return parseFloat(change) >= 0 ? (
      <svg
        className="mr-1 h-3 w-3 flex-shrink-0 self-center"
        fill="none"
        viewBox="0 0 12 12"
      >
        <path
          d="M3 4l3-3 3 3M6 1v10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ) : (
      <svg
        className="mr-1 h-3 w-3 flex-shrink-0 self-center"
        fill="none"
        viewBox="0 0 12 12"
      >
        <path
          d="M3 8l3 3 3-3M6 11V1"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <Card className={`${className} h-full`}>
      <div className="flex items-center">
        {icon && (
          <div className="flex-shrink-0 rounded-md bg-blue-100 p-3 ml-4">
            {icon}
          </div>
        )}
        <div className="w-full">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          {loading ? (
            <div className="mt-1 h-6 w-24 animate-pulse rounded bg-gray-200"></div>
          ) : (
            <div className="mt-1 flex items-baseline justify-between md:block">
              <div className="text-2xl font-semibold text-gray-900">
                {value}
              </div>
              {change && (
                <div
                  className={`flex items-baseline text-sm font-semibold ${getChangeColor()}`}
                >
                  {getChangeIcon()}
                  {change}
                </div>
              )}
            </div>
          )}
          {description && (
            <div className="mt-1 text-xs text-gray-500">{description}</div>
          )}
        </div>
      </div>
    </Card>
  );
};

StatsCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  description: PropTypes.string,
  change: PropTypes.string,
  icon: PropTypes.node,
  className: PropTypes.string,
  loading: PropTypes.bool
};

StatsCard.defaultProps = {
  className: '',
  loading: false
};

export default StatsCard;