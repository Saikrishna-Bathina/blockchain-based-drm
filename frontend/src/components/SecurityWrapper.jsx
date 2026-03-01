import React, { useEffect, useState } from 'react';
import { Button } from './ui/Button';

/**
 * Wrapper for protected content that handles visibility checking and deterrents.
 */
const SecurityWrapper = ({ children, onSecurityAlert }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setIsVisible(false);
                if (onSecurityAlert) onSecurityAlert('visibility_lost');
            } else {
                setIsVisible(true);
            }
        };

        const handleBlur = () => {
            setIsVisible(false);
            if (onSecurityAlert) onSecurityAlert('focus_lost');
        };

        const handleFocus = () => {
            setIsVisible(true);
        };

        const preventShortcuts = (e) => {
            // Block PrintScreen (partial), F12, Ctrl+Shift+I, etc.
            if (
                e.key === 'PrintScreen' || 
                e.keyCode === 44 || 
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
                (e.metaKey && e.altKey && e.key === 'i') || // Mac shortcuts
                e.key === 'F12'
            ) {
                e.preventDefault();
                alert('Screenshots and Developer Tools are disabled for this content.');
                return false;
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);
        window.addEventListener('keydown', preventShortcuts);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('keydown', preventShortcuts);
        };
    }, [onSecurityAlert]);

    return (
        <div className="relative w-full h-full">
            {children}
            
            {!isVisible && (
                <div className="absolute inset-0 z-[100] backdrop-blur-xl bg-black/80 flex items-center justify-center text-center p-6">
                    <div className="max-w-md space-y-4">
                        <div className="text-red-500 text-4xl mb-4">⚠️</div>
                        <h2 className="text-xl font-bold text-white">Playback Paused</h2>
                        <p className="text-gray-400">Content is hidden when the window loses focus to prevent unauthorized recording.</p>
                        
                        {window.electronAPI ? (
                             <Button 
                                onClick={() => setIsVisible(true)}
                                className="bg-brand-primary hover:bg-brand-primary/90 text-white px-8"
                             >
                                 Resume Content
                             </Button>
                        ) : (
                            <p className="text-brand-primary text-sm">Please return to the window to resume.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SecurityWrapper;
