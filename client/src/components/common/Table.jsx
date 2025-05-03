import React from 'react';
import PropTypes from 'prop-types';
import Loader from './Loader';

const Table = ({
  columns,
  data,
  loading,
  onRowClick,
  selectedRow,
  emptyMessage,
  className,
  stripped,
  hoverable,
  compact
}) => {
  // التحقق من وجود بيانات
  const hasData = data && data.length > 0;
  
  const tableStyles = `min-w-full divide-y divide-gray-200 ${
    stripped ? 'table-stripped' : ''
  } ${
    hoverable ? 'table-hover' : ''
  } ${
    compact ? 'table-compact' : ''
  } ${className}`;
  
  // تحديد نمط الصف
  const getRowStyles = (row, index) => {
    let styles = 'border-b border-gray-200';
    
    if (hoverable) {
      styles += ' hover:bg-gray-50 cursor-pointer';
    }
    
    if (stripped && index % 2 === 1) {
      styles += ' bg-gray-50';
    }
    
    if (selectedRow && selectedRow.id === row.id) {
      styles += ' bg-blue-50';
    }
    
    return styles;
  };
  
  // معالجة النقر على الصف
  const handleRowClick = (row) => {
    if (onRowClick) {
      onRowClick(row);
    }
  };
  
  return (
    <div className="flex flex-col w-full overflow-hidden border border-gray-200 rounded-lg">
      <div className="overflow-x-auto">
        <table className={tableStyles}>
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column.key || index}
                  scope="col"
                  className={`px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.className || ''
                  }`}
                  style={column.width ? { width: column.width } : {}}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-4 text-center">
                  <Loader />
                </td>
              </tr>
            ) : !hasData ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-4 text-center text-gray-500">
                  {emptyMessage || 'لا توجد بيانات للعرض'}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  className={getRowStyles(row, rowIndex)}
                  onClick={() => handleRowClick(row)}
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={`${rowIndex}-${column.key || colIndex}`}
                      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${
                        column.cellClassName || ''
                      }`}
                    >
                      {column.render
                        ? column.render(row, rowIndex)
                        : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

Table.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      title: PropTypes.node,
      className: PropTypes.string,
      cellClassName: PropTypes.string,
      width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      render: PropTypes.func
    })
  ).isRequired,
  data: PropTypes.array,
  loading: PropTypes.bool,
  onRowClick: PropTypes.func,
  selectedRow: PropTypes.object,
  emptyMessage: PropTypes.node,
  className: PropTypes.string,
  stripped: PropTypes.bool,
  hoverable: PropTypes.bool,
  compact: PropTypes.bool
};

Table.defaultProps = {
  data: [],
  loading: false,
  emptyMessage: 'لا توجد بيانات للعرض',
  className: '',
  stripped: true,
  hoverable: true,
  compact: false
};

export default Table;