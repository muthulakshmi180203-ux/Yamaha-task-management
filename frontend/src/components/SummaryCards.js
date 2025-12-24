import React from 'react';

const SummaryCards = ({ summary }) => {
    const cards = [
        { 
            type: 'total', 
            icon: 'fas fa-tasks', 
            value: summary.total, 
            label: 'Total Tasks',
            description: 'All active tasks',
            trend: null,
            color: '#003366'
        },
        { 
            type: 'completed', 
            icon: 'fas fa-check-circle', 
            value: summary.completed, 
            label: 'Completed',
            description: 'Finished tasks',
            trend: summary.total > 0 ? ((summary.completed / summary.total) * 100).toFixed(1) + '%' : '0%',
            color: '#28A745'
        },
        { 
            type: 'progress', 
            icon: 'fas fa-spinner', 
            value: summary.inProgress, 
            label: 'In Progress',
            description: 'Currently working',
            trend: summary.total > 0 ? ((summary.inProgress / summary.total) * 100).toFixed(1) + '%' : '0%',
            color: '#17A2B8'
        },
        { 
            type: 'hold', 
            icon: 'fas fa-pause-circle', 
            value: summary.onHold, 
            label: 'On Hold',
            description: 'Paused tasks',
            trend: summary.total > 0 ? ((summary.onHold / summary.total) * 100).toFixed(1) + '%' : '0%',
            color: '#FFC107'
        },
        { 
            type: 'delayed', 
            icon: 'fas fa-clock', 
            value: summary.notStarted, 
            label: 'Not Started',
            description: 'Pending tasks',
            trend: summary.total > 0 ? ((summary.notStarted / summary.total) * 100).toFixed(1) + '%' : '0%',
            color: '#6C757D'
        }
    ];

    const getProgressPercentage = () => {
        return summary.total > 0 ? Math.round((summary.completed / summary.total) * 100) : 0;
    };

    const getPerformanceIndicator = () => {
        const progress = getProgressPercentage();
        if (progress >= 80) return { text: 'Excellent', color: '#28A745', icon: 'fas fa-trophy' };
        if (progress >= 60) return { text: 'Good', color: '#17A2B8', icon: 'fas fa-thumbs-up' };
        if (progress >= 40) return { text: 'Average', color: '#FFC107', icon: 'fas fa-chart-line' };
        return { text: 'Needs Attention', color: '#DC3545', icon: 'fas fa-exclamation-triangle' };
    };

    const performance = getPerformanceIndicator();

    return (
        <div className="professional-summary-section">
            {/* Overall Performance Header */}
            <div className="performance-header">
                <div className="performance-main">
                    <h3 className="performance-title">
                        <i className="fas fa-chart-bar"></i>
                        Task Performance Overview
                    </h3>
                    <p className="performance-subtitle">
                        Real-time tracking of Project task progress
                    </p>
                </div>
                <div className="performance-indicator">
                    <div className="indicator-content">
                        <div className="indicator-icon" style={{ color: performance.color }}>
                            <i className={performance.icon}></i>
                        </div>
                        <div className="indicator-text">
                            <span className="indicator-label">Performance</span>
                            <span className="indicator-value" style={{ color: performance.color }}>
                                {performance.text}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Cards Grid */}
            <div className="professional-summary-grid">
                {cards.map((card, index) => (
                    <div 
                        key={index} 
                        className={`professional-summary-card ${card.type}`}
                        style={{ '--card-color': card.color }}
                    >
                        <div className="card-decoration">
                            <div className="decoration-bar"></div>
                            <div className="decoration-corner"></div>
                        </div>
                        
                        <div className="card-header">
                            <div className="card-icon">
                                <i className={card.icon}></i>
                            </div>
                            <div className="card-trend">
                                {card.trend && (
                                    <span className="trend-value">{card.trend}</span>
                                )}
                            </div>
                        </div>

                        <div className="card-content">
                            <div className="card-value">{card.value}</div>
                            <div className="card-label">{card.label}</div>
                            <div className="card-description">{card.description}</div>
                        </div>

                        <div className="card-footer">
                            <div className="progress-indicator">
                                <div 
                                    className="progress-track" 
                                    style={{
                                        width: summary.total > 0 ? `${(card.value / summary.total) * 100}%` : '0%'
                                    }}
                                ></div>
                            </div>
                        </div>

                        {/* Hover Effect Elements */}
                        <div className="card-hover-effect"></div>
                    </div>
                ))}
            </div>

            {/* Progress Overview */}
            <div className="progress-overview-cards">
                <div className="progress-card overall-progress">
                    <div className="progress-card-header">
                        <h4 className="progress-card-title">
                            <i className="fas fa-bullseye"></i>
                            Overall Progress
                        </h4>
                        <span className="progress-percentage">{getProgressPercentage()}%</span>
                    </div>
                    <div className="progress-card-body">
                        <div className="progress-bar-large">
                            <div 
                                className="progress-fill-large" 
                                style={{ width: `${getProgressPercentage()}%` }}
                            ></div>
                        </div>
                        <div className="progress-stats">
                            <div className="stat-item">
                                <span className="stat-label">Completed</span>
                                <span className="stat-value">{summary.completed}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Remaining</span>
                                <span className="stat-value">{summary.total - summary.completed}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="progress-card efficiency-card">
                    <div className="progress-card-header">
                        <h4 className="progress-card-title">
                            <i className="fas fa-rocket"></i>
                            Efficiency Metrics
                        </h4>
                        <span className="efficiency-score">{getProgressPercentage()}%</span>
                    </div>
                    <div className="progress-card-body">
                        <div className="efficiency-metrics">
                            <div className="metric">
                                <span className="metric-label">Completion Rate</span>
                                <div className="metric-bar">
                                    <div 
                                        className="metric-fill completion" 
                                        style={{ width: `${getProgressPercentage()}%` }}
                                    ></div>
                                </div>
                                <span className="metric-value">{getProgressPercentage()}%</span>
                            </div>
                            <div className="metric">
                                <span className="metric-label">Active Tasks</span>
                                <div className="metric-bar">
                                    <div 
                                        className="metric-fill active" 
                                        style={{ width: `${summary.total > 0 ? ((summary.inProgress / summary.total) * 100) : 0}%` }}
                                    ></div>
                                </div>
                                <span className="metric-value">{summary.inProgress}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SummaryCards;