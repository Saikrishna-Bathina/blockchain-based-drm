import React, { useState, useEffect } from 'react';

/**
 * A watermark that moves to random positions to prevent easy cropping/masking in recordings.
 */
const MovingWatermark = ({ userId, licenseId }) => {
    const [position, setPosition] = useState({ top: '10%', left: '10%' });

    useEffect(() => {
        const moveWatermark = () => {
            const randomTop = Math.floor(Math.random() * 80) + 5; // 5% to 85%
            const randomLeft = Math.floor(Math.random() * 80) + 5; // 5% to 85%
            setPosition({ top: `${randomTop}%`, left: `${randomLeft}%` });
        };

        const interval = setInterval(moveWatermark, 8000); // Move every 8 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <div 
            className="absolute z-50 pointer-events-none select-none transition-all duration-1000 ease-in-out"
            style={{ 
                top: position.top, 
                left: position.left,
                color: 'rgba(255, 255, 255, 0.15)',
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                whiteSpace: 'nowrap'
            }}
        >
            <div>USER: {userId}</div>
            <div>LICENSE: {licenseId}</div>
            <div>SECURE CONTENT - DO NOT RECORD</div>
        </div>
    );
};

export default MovingWatermark;
