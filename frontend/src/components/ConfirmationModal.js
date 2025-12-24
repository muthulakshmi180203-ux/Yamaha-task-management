import React, { useEffect } from 'react';

const ConfirmationModal = ({ 
    isOpen, 
    onConfirm, 
    onCancel, 
    title = "Confirm Action", 
    message = "Are you sure you want to proceed?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "warning", // success, warning, danger, info
    isLoading = false,
    confirmButtonProps = {},
    cancelButtonProps = {}
}) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onCancel();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    const getModalConfig = () => {
        const configs = {
            warning: {
                icon: 'fas fa-exclamation-triangle',
                iconColor: '#FFC107',
                headerBg: 'linear-gradient(135deg, #FFF3CD, #FFEAA7)',
                borderColor: '#FFC107',
                confirmButton: 'btn-warning'
            },
            danger: {
                icon: 'fas fa-exclamation-circle',
                iconColor: '#DC3545',
                headerBg: 'linear-gradient(135deg, #F8D7DA, #F5C6CB)',
                borderColor: '#DC3545',
                confirmButton: 'btn-danger'
            },
            success: {
                icon: 'fas fa-check-circle',
                iconColor: '#28A745',
                headerBg: 'linear-gradient(135deg, #D4EDDA, #C3E6CB)',
                borderColor: '#28A745',
                confirmButton: 'btn-success'
            },
            info: {
                icon: 'fas fa-info-circle',
                iconColor: '#17A2B8',
                headerBg: 'linear-gradient(135deg, #D1ECF1, #BEE5EB)',
                borderColor: '#17A2B8',
                confirmButton: 'btn-info'
            }
        };
        return configs[type] || configs.warning;
    };

    const modalConfig = getModalConfig();

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onCancel();
        }
    };

    const handleConfirm = () => {
        if (!isLoading) {
            onConfirm();
        }
    };

    return (
        <div 
            className="professional-modal-overlay" 
            onClick={handleBackdropClick}
            data-open={isOpen}
        >
            <div className="professional-modal-container">
                <div 
                    className="professional-modal"
                    style={{ '--modal-accent': modalConfig.borderColor }}
                >
                    {/* Modal Header */}
                    <div 
                        className="modal-header"
                        style={{ background: modalConfig.headerBg }}
                    >
                        <div className="header-content">
                            <div className="header-icon">
                                <i 
                                    className={modalConfig.icon} 
                                    style={{ color: modalConfig.iconColor }}
                                ></i>
                            </div>
                            <div className="header-text">
                                <h3 className="modal-title">{title}</h3>
                                <div className="modal-subtitle">Please confirm your action</div>
                            </div>
                        </div>
                        <button 
                            className="modal-close-btn"
                            onClick={onCancel}
                            disabled={isLoading}
                            aria-label="Close modal"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>

                    {/* Modal Body */}
                    <div className="modal-body">
                        <div className="message-content">
                            <div className="message-icon">
                                <i className={modalConfig.icon}></i>
                            </div>
                            <div className="message-text">
                                <p className="modal-message">{message}</p>
                                <div className="action-context">
                                    <div className="context-item">
                                        <i className="fas fa-clock"></i>
                                        <span>This action will be recorded in the audit log</span>
                                    </div>
                                    <div className="context-item">
                                        <i className="fas fa-history"></i>
                                        <span>You can revert this action within 24 hours</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Warning Section for Critical Actions */}
                        {type === 'danger' && (
                            <div className="warning-section">
                                <div className="warning-header">
                                    <i className="fas fa-radiation"></i>
                                    <strong>Critical Action</strong>
                                </div>
                                <div className="warning-content">
                                    This action cannot be undone. Please ensure you have appropriate permissions 
                                    and understand the consequences before proceeding.
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Modal Footer */}
                    <div className="modal-footer">
                        <div className="footer-actions">
                            <button
                                className={`btn ${modalConfig.confirmButton} confirm-btn`}
                                onClick={handleConfirm}
                                disabled={isLoading}
                                {...confirmButtonProps}
                            >
                                {isLoading ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-check"></i>
                                        {confirmText}
                                    </>
                                )}
                            </button>
                            
                            <button
                                className="btn btn-outline cancel-btn"
                                onClick={onCancel}
                                disabled={isLoading}
                                {...cancelButtonProps}
                            >
                                <i className="fas fa-times"></i>
                                {cancelText}
                            </button>
                        </div>

                        <div className="footer-note">
                            <i className="fas fa-shield-alt"></i>
                            <span>Your data is secured with enterprise-grade encryption</span>
                        </div>
                    </div>

                    {/* Modal Decoration */}
                    <div className="modal-decoration">
                        <div className="decoration-bar"></div>
                    </div>
                </div>
            </div>

            {/* Backdrop Blur */}
            <div className="modal-backdrop"></div>
        </div>
    );
};

export default ConfirmationModal;