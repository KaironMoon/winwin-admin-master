import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * 관리자 페이지 필터 메뉴 컴포넌트
 *
 * 전체(AdminPage), 사용자정보(UserListPage), 거래정보(TransactionListPage) 필터 메뉴를 표시합니다.
 */
function AdminTabNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const menus = [
    { id: 'all', name: '전체', path: '/admin' },
    { id: 'users', name: '사용자정보', path: '/user-list' },
    { id: 'transactions', name: '거래정보', path: '/transaction-list' }
  ];

  const isActiveMenu = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="flex items-center space-x-2 mb-4">
      {menus.map((menu) => (
        <button
          key={menu.id}
          onClick={() => navigate(menu.path)}
          className={`
            px-3 py-1.5 text-sm font-medium rounded transition-colors
            ${isActiveMenu(menu.path)
              ? 'bg-gray-800 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }
          `}
        >
          {menu.name}
        </button>
      ))}
    </div>
  );
}

export default AdminTabNav;
