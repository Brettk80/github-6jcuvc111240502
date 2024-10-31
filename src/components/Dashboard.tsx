import React, { useState, useRef } from 'react';
import { Bell, Package2, Video, FileText, Mail, BarChart3, HelpCircle, X, Send, Ban, Settings, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Inbox from './Inbox';
import FaxBroadcast from './fax/FaxBroadcast';
import BroadcastReports from './reports/BroadcastReports';
import SettingsLayout from './settings/SettingsLayout';
import ProfileSettings from './settings/ProfileSettings';

interface DashboardProps {
  user: {
    name: string;
    email: string;
  };
}

interface Notification {
  id: string;
  fromNumber: string;
  toNumber: string;
  userInbox: string;
  pages: number;
  timestamp: string;
  read: boolean;
  previewUrl: string;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showGettingStarted, setShowGettingStarted] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [activeSection, setActiveSection] = useState<'inbox' | 'broadcast' | 'reports' | 'settings' | 'profile'>('inbox');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const isAccountOwner = true;

  const unreadCount = notifications.filter(n => !n.read).length;

  const sections = [
    { 
      id: 'inbox', 
      label: 'Fax Inbox', 
      icon: Mail,
      onClick: () => {
        setActiveSection('inbox');
      }
    },
    { 
      id: 'broadcast', 
      label: 'Fax Broadcast', 
      icon: Send,
      onClick: () => {
        setActiveSection('broadcast');
        setShowGettingStarted(false);
      }
    },
    { 
      id: 'reports', 
      label: 'Reports', 
      icon: BarChart3,
      onClick: () => {
        setActiveSection('reports');
        setShowGettingStarted(false);
      }
    },
    { 
      id: 'settings', 
      label: 'Block Lists & IVR', 
      icon: Ban,
      onClick: () => {
        setActiveSection('settings');
        setShowGettingStarted(false);
      }
    }
  ];

  const handleMarkAllAsRead = () => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification => ({
        ...notification,
        read: true
      }))
    );
  };

  const handleNotificationClick = (notification: Notification) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(n =>
        n.id === notification.id
          ? { ...n, read: true }
          : n
      )
    );
    setSelectedNotification(notification);
    setShowNotifications(false);
  };

  // Close menus when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center">
                <h1 className="flex flex-col sm:flex-row sm:items-center">
                  <span className="text-xl sm:text-2xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900">
                    OPENFAX
                  </span>
                  <span className="text-[0.65rem] sm:text-xs sm:ml-2 font-medium text-gray-400 tracking-widest uppercase">
                    Secure Fax Portal
                  </span>
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowGettingStarted(true)}
                className="text-gray-500 hover:text-gray-700"
              >
                <HelpCircle className="h-6 w-6" />
              </button>
              <div className="relative" ref={notificationRef}>
                <button
                  className="p-2 text-gray-400 hover:text-gray-500 relative"
                  onMouseEnter={() => setShowNotifications(true)}
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Notifications</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllAsRead}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="text-gray-500 text-center py-4">No new notifications</p>
                        ) : (
                          notifications.map(notification => (
                            <div
                              key={notification.id}
                              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                notification.read ? 'bg-gray-50' : 'bg-blue-50'
                              }`}
                              onClick={() => handleNotificationClick(notification)}
                            >
                              <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-lg overflow-hidden">
                                  <img
                                    src={notification.previewUrl}
                                    alt="Fax preview"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900">
                                    New fax from {notification.fromNumber}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    To: {notification.userInbox} ({notification.toNumber})
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {notification.pages} pages • {notification.timestamp}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                >
                  <span className="text-sm font-medium">{user.name}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50"
                    >
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setActiveSection('profile');
                            setShowUserMenu(false);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Account Settings
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* Sidebar */}
          {activeSection !== 'profile' && (
            <div className="w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <nav className="space-y-2">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={section.onClick}
                        className={`w-full flex items-center p-3 text-left rounded-lg transition-colors ${
                          activeSection === section.id
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        <span>{section.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {showGettingStarted && activeSection === 'inbox' && (
              <div className="mb-8 bg-white rounded-lg shadow-sm">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-semibold text-gray-900">Welcome to OpenFax</h2>
                    <button 
                      onClick={() => setShowGettingStarted(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="mt-4 grid md:grid-cols-2 gap-6">
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <Video className="w-full h-full text-gray-400" />
                    </div>
                    <div className="space-y-4">
                      <p className="text-gray-600">
                        Get started with OpenFax by exploring these key features:
                      </p>
                      {sections.map((section) => {
                        const Icon = section.icon;
                        return (
                          <button
                            key={section.id}
                            onClick={section.onClick}
                            className="w-full flex items-center p-3 text-left rounded-lg hover:bg-gray-50"
                          >
                            <Icon className="h-5 w-5 text-gray-400 mr-3" />
                            <span className="text-gray-700">{section.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-8">
              {activeSection === 'inbox' && (
                <Inbox 
                  isAccountOwner={isAccountOwner}
                  selectedFax={selectedNotification ? {
                    id: selectedNotification.id,
                    date: selectedNotification.timestamp,
                    fromNumber: selectedNotification.fromNumber,
                    ssid: `FAX${selectedNotification.id}`,
                    toNumber: selectedNotification.toNumber,
                    assignedUser: selectedNotification.userInbox,
                    pageCount: selectedNotification.pages,
                    previewUrl: selectedNotification.previewUrl,
                    pdfUrl: 'https://example.com/fax.pdf'
                  } : null}
                  onFaxSelected={() => setSelectedNotification(null)}
                  onNewFax={(count) => {
                    const newNotification: Notification = {
                      id: Date.now().toString(),
                      fromNumber: '+1234567890',
                      toNumber: '+0987654321',
                      userInbox: 'John Doe',
                      pages: Math.floor(Math.random() * 5) + 1,
                      timestamp: new Date().toLocaleString(),
                      read: false,
                      previewUrl: 'https://example.com/fax-preview.jpg'
                    };
                    setNotifications(prev => [newNotification, ...prev]);
                  }} 
                />
              )}
              {activeSection === 'broadcast' && <FaxBroadcast />}
              {activeSection === 'reports' && <BroadcastReports />}
              {activeSection === 'settings' && <SettingsLayout />}
              {activeSection === 'profile' && <ProfileSettings />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;