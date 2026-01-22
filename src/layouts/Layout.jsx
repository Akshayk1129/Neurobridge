import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Brain, Stethoscope, Activity, Users, Settings, Menu, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Layout = ({ children }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const location = useLocation();

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'AI Screening', path: '/screening', icon: Brain },
        { name: 'Therapy Plan', path: '/therapy', icon: Activity },
        { name: 'Progress', path: '/progress', icon: Stethoscope }, // Reusing icon for demo
        { name: 'Community', path: '/community', icon: Users },
    ];

    // Helper to merge classes
    function cn(...inputs) {
        return twMerge(clsx(inputs));
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* Navigation */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                                    <Brain className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xl font-bold text-slate-900 tracking-tight">NeuroBridge AI</span>
                            </Link>
                        </div>

                        {/* Desktop Nav */}
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        className={cn(
                                            "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200",
                                            isActive
                                                ? "border-primary-500 text-slate-900"
                                                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                                        )}
                                    >
                                        <item.icon className="w-4 h-4 mr-2" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="hidden sm:ml-6 sm:flex sm:items-center">
                            <Link to="/clinician" className="text-sm font-medium text-slate-500 hover:text-primary-600">
                                Clinician Mode
                            </Link>
                            <div className="ml-4 relative">
                                <button className="bg-primary-50 text-primary-700 p-2 rounded-full hover:bg-primary-100 transition-colors">
                                    <span className="sr-only">Settings</span>
                                    <Settings className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Mobile menu button */}
                        <div className="-mr-2 flex items-center sm:hidden">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                            >
                                <span className="sr-only">Open main menu</span>
                                {isMobileMenuOpen ? (
                                    <X className="block h-6 w-6" aria-hidden="true" />
                                ) : (
                                    <Menu className="block h-6 w-6" aria-hidden="true" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="sm:hidden bg-white border-b border-slate-200">
                        <div className="pt-2 pb-3 space-y-1">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={cn(
                                            "flex items-center pl-3 pr-4 py-2 border-l-4 text-base font-medium",
                                            isActive
                                                ? "bg-primary-50 border-primary-500 text-primary-700"
                                                : "border-transparent text-slate-500 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700"
                                        )}
                                    >
                                        <item.icon className="w-5 h-5 mr-3" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                            <Link
                                to="/clinician"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-slate-500 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700"
                            >
                                <Users className="w-5 h-5 mr-3" />
                                Clinician View
                            </Link>
                        </div>
                    </div>
                )}
            </nav>

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>

            <footer className="bg-white border-t border-slate-200">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center text-sm text-slate-500">
                    <p>© 2024 NeuroBridge AI. Demo Platform.</p>
                    <div className="flex space-x-4">
                        <Link to="/consent" className="hover:text-slate-900">Privacy & Consent</Link>
                        <span>|</span>
                        <span>v1.0.0-Demo</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
