
import React from 'react';
import { Menu, User, Home, ChevronRight } from 'lucide-react';

interface HeaderProps {
  title: string;
  breadcrumbs: string[];
  toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, breadcrumbs, toggleSidebar }) => {
  return (
    <header className="bg-white shadow-sm z-20 sticky top-0">
      {/* Top Blue Bar */}
      <div className="bg-blue-600 h-14 flex items-center justify-between px-4 lg:px-6 text-white shadow-md">
        <div className="flex items-center gap-4">
          <button onClick={toggleSidebar} className="p-1 hover:bg-blue-700 rounded lg:hidden">
            <Menu size={24} />
          </button>
          <button className="hidden lg:block p-1 hover:bg-blue-700 rounded">
             <Menu size={20} />
          </button>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 cursor-pointer hover:bg-blue-700 px-2 py-1 rounded transition-colors">
                <User size={20} />
                <span className="text-sm font-medium hidden sm:block uppercase">SABRINA ALAM</span>
            </div>
        </div>
      </div>

      {/* Breadcrumb Bar */}
      <div className="bg-white border-b px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h1 className="text-xl font-medium text-gray-700">{title}</h1>
        <div className="flex items-center text-xs text-gray-500">
           <Home size={12} className="mr-1" />
           {breadcrumbs.map((crumb, index) => (
               <React.Fragment key={index}>
                   {index > 0 && <ChevronRight size={12} className="mx-1" />}
                   <span className={index === breadcrumbs.length - 1 ? 'text-gray-400' : ''}>{crumb}</span>
               </React.Fragment>
           ))}
        </div>
      </div>
    </header>
  );
};
