import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children, userType, currentPage }) {
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showHamburger, setShowHamburger] = useState(false);
  const [isSupervised, setIsSupervised] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      // Only show hamburger icon on mobile/small screens
      setShowHamburger(mobile);
      
      // On mobile/small screens, hide sidebar by default
      if (mobile) {
        setShowSidebar(false);
      } else {
        setShowSidebar(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Check if student is supervised
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.group_id && userType === 'student') {
      setIsSupervised(currentUser.isSupervised || false);
    }
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [userType]);

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <div className="min-h-screen bg-transparent flex">
      {/* Hamburger Menu Button - Only visible on small screens */}
      {showHamburger && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 bg-white/10 backdrop-blur border border-white/20 text-white hover:bg-white/20 rounded-xl"
        >
          <Menu className="w-5 h-5" />
        </Button>
      )}

      {/* Sidebar - Visible based on showSidebar state */}
      {showSidebar && (
        <div className="fixed left-0 top-0 h-full z-40 w-64">
          <Sidebar 
            userType={userType} 
            isSupervised={isSupervised}
            currentPage={currentPage} 
          />
        </div>
      )}

      {/* Main Content - Adjust margin based on sidebar visibility */}
      <main className={`flex-1 transition-all duration-300 ${
        showSidebar && !isMobile ? 'md:ml-64' : ''
      }`}>
        <div className="p-6 md:p-8 pt-20 text-white">
          {children}
        </div>
      </main>
    </div>
  );
}