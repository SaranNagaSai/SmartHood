// Service Completion Modal - Used to confirm work completion with optional revenue entry
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCheck, FaRupeeSign, FaStar, FaClipboardCheck } from 'react-icons/fa';
import API from '../../services/api';
import Button from "../ui/Button";
import TextField from "../ui/TextField";
import TextAreaField from "../ui/TextAreaField";
import useToast from "../../hooks/useToast";

export default function ServiceCompletionModal({
    isOpen,
    onClose,
    service,
    isProvider,
    onSuccess,
    onRatingOpen
}) {
    const { addToast } = useToast();
    const [revenue, setRevenue] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState('confirm'); // 'confirm' | 'success'

    const handleComplete = async () => {
        try {
            setLoading(true);
            await API.put(`/services/${service._id}/complete`, {
                confirmedBy: isProvider ? 'provider' : 'requester',
                revenue: revenue ? parseFloat(revenue) : undefined,
                notes
            });
            setStep('success');
        } catch (error) {
            addToast(error.response?.data?.message || "Failed to confirm completion", { type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (step === 'success') {
            onSuccess?.();
            // Trigger rating modal if user was the requester
            if (!isProvider && onRatingOpen) {
                onRatingOpen();
            }
        }
        onClose();
        setStep('confirm');
        setRevenue('');
        setNotes('');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="completion-modal-overlay" onClick={handleClose}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="completion-modal glass"
                        onClick={e => e.stopPropagation()}
                    >
                        <Button className="modal-close" variant="ghost" size="sm" onClick={handleClose} aria-label="Close">
                            <FaTimes />
                        </Button>

                        {step === 'confirm' ? (
                            <>
                                <div className="completion-header">
                                    <FaClipboardCheck size={50} color="var(--color-success-600)" />
                                    <h2>Confirm Completion</h2>
                                    <p>Mark this service as completed?</p>
                                </div>

                                {/* Service Summary */}
                                <div className="service-summary">
                                    <div className="summary-row">
                                        <span>Service:</span>
                                        <strong>{service?.category}</strong>
                                    </div>
                                    <div className="summary-row">
                                        <span>{isProvider ? 'Requester:' : 'Provider:'}</span>
                                        <strong>
                                            {isProvider ? service?.requesterId?.name : service?.providerId?.name}
                                        </strong>
                                    </div>
                                </div>

                                {/* Revenue Entry (for provider) */}
                                {isProvider && (
                                    <div className="revenue-section">
                                        <label>
                                            <FaRupeeSign /> Revenue Earned (Optional)
                                        </label>
                                        <TextField
                                            type="number"
                                            placeholder="Enter amount..."
                                            value={revenue}
                                            onChange={e => setRevenue(e.target.value)}
                                        />
                                        <small>This helps track community economy</small>
                                    </div>
                                )}

                                {/* Notes */}
                                <div className="notes-section">
                                    <label>Completion Notes (Optional)</label>
                                    <TextAreaField
                                        placeholder="Any notes about the work done..."
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                        rows={2}
                                    />
                                </div>

                                <div className="completion-actions">
                                    <Button variant="secondary" onClick={handleClose}>
                                        Cancel
                                    </Button>

                                    <Button
                                        onClick={handleComplete}
                                        disabled={loading}
                                        loading={loading}
                                        leftIcon={<FaCheck />}
                                    >
                                        Confirm Completion
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="success-content"
                                >
                                    <div className="success-icon">
                                        <FaCheck size={40} />
                                    </div>
                                    <h2>Work Completed!</h2>
                                    <p>Thank you for contributing to the community.</p>

                                    {!isProvider && (
                                        <div className="rating-prompt">
                                            <FaStar color="var(--color-warning-500)" />
                                            <span>Would you like to rate this service?</span>
                                        </div>
                                    )}

                                    <Button onClick={handleClose}>
                                        {!isProvider ? 'Rate Now' : 'Done'}
                                    </Button>
                                </motion.div>
                            </>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
