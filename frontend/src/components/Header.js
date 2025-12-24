import React, { useState, useEffect } from 'react';

const Header = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <header className="professional-header">
            <div className="header-content">
                {/* Left Section - Branding */}
                <div className="header-left">
                    <div className="logo">
                        <div className="logo-icon">
                            <i className="fas fa-industry"></i>
                        </div>
                        <div className="brand">
                            <h1 className="company-name">Be Chill</h1>
                            <p className="app-name">Project Dashboard</p>
                        </div>
                    </div>
                </div>

                {/* Center Section - Greeting */}
                <div className="header-center">
                    <div className="greeting">
                        <i className="fas fa-hand-wave"></i>
                        <span>{getGreeting()},  Team</span>
                    </div>
                    <div className="current-date">
                        {currentTime.toLocaleDateString('en-US', { 
                            weekday: 'long',
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </div>
                </div>

                {/* Right Section - Time & Status */}
                <div className="header-right">
                    <div className="time-display">
                        <div className="time-icon">
                            <i className="fas fa-clock"></i>
                        </div>
                        <div className="time-info">
                            <div className="current-time">
                                {currentTime.toLocaleTimeString('en-US', { 
                                    hour: '2-digit', 
                                    minute: '2-digit',
                                    second: '2-digit'
                                })}
                            </div>
                            <div className="time-label">Local Time</div>
                        </div>
                    </div>
                    
                    <div className="status-indicator">
                        <div className="status-dot online"></div>
                        <span>System Online</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;