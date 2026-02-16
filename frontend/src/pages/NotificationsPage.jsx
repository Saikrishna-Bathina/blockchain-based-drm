import React, { useState } from 'react';
import { Bell, Check, Info, ShieldAlert, FileCheck, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            type: 'system',
            title: 'System Maintenance Scheduled',
            message: 'The platform will undergo scheduled maintenance on Feb 25th from 2:00 AM to 4:00 AM UTC. Services may be intermittently unavailable.',
            timestamp: new Date().toISOString(),
            read: false,
        },
        {
            id: 2,
            type: 'asset',
            title: 'Asset Verification Complete',
            message: 'Your asset "Project Alpha Blueprint" has been successfully verified against the global registry. You can now proceed to minting.',
            timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            read: false,
        },
        {
            id: 3,
            type: 'security',
            title: 'New Login Detected',
            message: 'We detected a new login from Chrome on Windows 11. If this wasn\'t you, please secure your account immediately.',
            timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            read: true,
        },
        {
            id: 4,
            type: 'system',
            title: 'Welcome to BlockDRM',
            message: 'Thank you for joining. Start by uploading your first asset to secure your digital rights.',
            timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            read: true,
        }
    ]);

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const deleteNotification = (id) => {
        setNotifications(notifications.filter(n => n.id !== id));
    };

    const getIcon = (type) => {
        switch (type) {
            case 'system': return <Info className="h-5 w-5 text-blue-400" />;
            case 'security': return <ShieldAlert className="h-5 w-5 text-red-400" />;
            case 'asset': return <FileCheck className="h-5 w-5 text-green-400" />;
            default: return <Bell className="h-5 w-5 text-zinc-400" />;
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-12">
            <div className="flex items-end justify-between border-b border-zinc-800 pb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Notifications</h1>
                    <p className="text-sm text-zinc-500 mt-1">Stay updated with your account activity and system alerts.</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-xs text-zinc-500">
                        {unreadCount} unread
                    </span>
                    {unreadCount > 0 && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={markAllAsRead}
                            className="h-8 text-xs text-zinc-400 hover:text-white"
                        >
                            <Check className="h-3 w-3 mr-1.5" />
                            Mark all as read
                        </Button>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <div className="text-center py-20 bg-zinc-950/50 rounded-lg border border-zinc-800 border-dashed">
                        <Bell className="h-10 w-10 text-zinc-700 mx-auto mb-4" />
                        <h3 className="text-white font-medium">All caught up!</h3>
                        <p className="text-zinc-500 text-sm mt-1">You have no new notifications.</p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div 
                            key={notification.id}
                            className={cn(
                                "group relative p-4 rounded-lg border transition-all",
                                notification.read 
                                    ? "bg-black border-zinc-800/50 opacity-75 hover:opacity-100" 
                                    : "bg-zinc-900/20 border-zinc-700 shadow-sm"
                            )}
                        >
                            <div className="flex gap-4">
                                <div className={cn(
                                    "h-10 w-10 rounded-full flex items-center justify-center border shrink-0",
                                    notification.read ? "bg-zinc-900 border-zinc-800" : "bg-zinc-900 border-zinc-700"
                                )}>
                                    {getIcon(notification.type)}
                                </div>
                                
                                <div className="flex-1 pr-8">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className={cn(
                                            "text-sm font-medium",
                                            notification.read ? "text-zinc-300" : "text-white"
                                        )}>
                                            {notification.title}
                                        </h4>
                                        <span className="text-xs text-zinc-500 font-mono">
                                            {format(new Date(notification.timestamp), 'MMM d, h:mm a')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-zinc-500 leading-relaxed">
                                        {notification.message}
                                    </p>
                                </div>

                                <button 
                                    onClick={() => deleteNotification(notification.id)}
                                    className="absolute top-4 right-4 p-1 rounded hover:bg-zinc-800 text-zinc-600 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            
                            {!notification.read && (
                                <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-brand-primary group-hover:opacity-0 transition-opacity" />
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
