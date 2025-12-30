import React from 'react';
import { Screen } from '../types';

interface MobileNavProps {
    currentScreen: Screen;
    onNavigate: (screen: Screen) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentScreen, onNavigate }) => {
    const navItems = [
        { id: Screen.DASHBOARD, icon: 'dashboard', label: 'Home' },
        { id: Screen.REVIEW, icon: 'rate_review', label: 'Review' },
        { id: Screen.LEARN, icon: 'school', label: 'Learn' },
        { id: Screen.HISTORY, icon: 'history', label: 'History' },
        { id: Screen.SETTINGS, icon: 'settings', label: 'Settings' },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-50 safe-area-inset-bottom">
            <div className="flex items-center justify-around px-2 py-2">
                {navItems.map((item) => {
                    const isActive = currentScreen === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`flex flex-col items-center justify-center min-w-[60px] py-2 px-3 rounded-lg transition-all duration-200 ${isActive
                                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                    : 'text-slate-500 dark:text-slate-400 active:bg-slate-100 dark:active:bg-slate-800'
                                }`}
                        >
                            <span className="material-icons-round text-[22px] mb-0.5">
                                {item.icon}
                            </span>
                            <span className="text-[10px] font-medium">
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};
