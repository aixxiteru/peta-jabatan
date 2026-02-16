
import React, { useState, useRef, useEffect } from 'react';
import { Menu, User, Home, ChevronRight } from 'lucide-react';

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 32 32" fill="currentColor" height="1em" width="1em" {...props}>
    <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.832 4.584 2.236 6.393L4 29l7.828-2.205C13.41 27.597 14.686 28 16 28c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22c-1.18 0-2.336-.207-3.432-.615l-.245-.088-4.646 1.308 1.242-4.81-.16-.247C7.26 18.13 6.5 16.6 6.5 15c0-5.238 4.262-9.5 9.5-9.5s9.5 4.262 9.5 9.5-4.262 9.5-9.5 9.5zm5.07-6.13c-.277-.139-1.637-.807-1.89-.899-.253-.093-.437-.139-.62.139-.184.277-.713.899-.874 1.084-.16.184-.32.208-.597.07-.277-.139-1.17-.431-2.23-1.374-.824-.735-1.38-1.64-1.542-1.917-.16-.277-.017-.427.122-.565.126-.125.277-.32.416-.48.139-.16.185-.277.277-.462.093-.184.046-.347-.023-.485-.07-.139-.62-1.497-.849-2.05-.224-.54-.453-.466-.62-.475l-.527-.01c-.17 0-.446.064-.68.3-.233.233-.89.87-.89 2.122 0 1.253.911 2.463 1.038 2.635.126.17 1.793 2.736 4.348 3.728.608.209 1.082.334 1.452.427.61.155 1.166.133 1.606.081.49-.058 1.637-.668 1.87-1.312.232-.645.232-1.197.162-1.312-.07-.116-.253-.185-.53-.324z" />
  </svg>
);

interface HeaderProps {
  title: string;
  breadcrumbs: string[];
  toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, breadcrumbs, toggleSidebar }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

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
          <div className="relative" ref={dropdownRef}>
            <div
              className="flex items-center gap-2 cursor-pointer hover:bg-blue-700 px-2 py-1 rounded transition-colors"
              onClick={() => setDropdownOpen((v) => !v)}
            >
              <User size={20} />
              <span className="text-sm font-medium hidden sm:block uppercase">SABRINA ALAM</span>
            </div>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded shadow-lg z-50 border border-gray-200 animate-fade-in">
                <a
                  href="https://wa.me/6282324404850"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-3 text-gray-700 text-sm hover:bg-green-50 hover:text-green-700 cursor-pointer transition-colors"
                >
                  <span className="text-green-500"><WhatsAppIcon style={{ fontSize: 20 }} /></span>
                  <span className="font-medium">Hubungi Developer</span>
                </a>
              </div>
            )}
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
