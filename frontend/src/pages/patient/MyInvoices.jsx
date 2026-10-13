import React, { useEffect, useState } from 'react';
import { CreditCard, DollarSign, Printer, CheckCircle2 } from 'lucide-react';
import { billingService, patientService } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import InvoicePrintModal from '../../components/InvoicePrintModal';
import Alert from '../../components/Alert';

export default function MyInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [patientProfile, setPatientProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Payment Modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Print Modal
  const [printModalOpen, setPrintModalOpen] = useState(false);

  useEffect(() => {
    patientService.getMe().then((res) => {
      setPatientProfile(res.data);
      loadInvoices(res.data.id);
    }).catch(console.error);
  }, []);

  const loadInvoices = async (patientId) => {
    try {
      setLoading(true);
      const res = await billingService.getInvoices({ patientId, size: 50 });
      setInvoices(res.data.content || []);
    } catch (err) {
      console.error(err);
      setAlert({ type: 'error', message: 'Failed to load your billing history.' });
    } finally {
      setLoading(false);
    }
  };

  const openPayModal = (inv) => {
    setSelectedInvoice(inv);
    setPaymentAmount(inv.balanceAmount);
    setPaymentMethod('CREDIT_CARD');
    setPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    try {
      setSubmittingPayment(true);
      await billingService.recordPayment(selectedInvoice.id, {
        amount: parseFloat(paymentAmount),
        paymentMethod,
        notes: 'Patient portal self-service payment',
      });

      setAlert({ type: 'success', message: `Payment of $${paymentAmount} processed successfully!` });
      setPaymentModalOpen(false);
      if (patientProfile) loadInvoices(patientProfile.id);
    } catch (err) {
      const msg = err.response?.data?.message || 'Payment processing failed.';
      setAlert({ type: 'error', message: msg });
    } finally {
      setSubmittingPayment(false);
    }
  };

  const openPrint = (inv) => {
    setSelectedInvoice(inv);
    setPrintModalOpen(true);
  };

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>My Invoices & Billing Statements</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
          Review itemized charges, settled amounts, and pay outstanding balances securely
        </p>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="card" style={{ padding: 0 }}>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Issue Date</th>
                <th>Consultation & Items</th>
                <th>Total ($)</th>
                <th>Paid ($)</th>
                <th>Remaining Balance</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>Loading billing statements...</td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No bills or invoices issued yet.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td><span style={{ fontWeight: 700, color: 'var(--primary)' }}>#{inv.invoiceNumber}</span></td>
                    <td>{inv.issueDate}</td>
                    <td style={{ fontSize: '0.85rem' }}>
                      ${Number(inv.consultationFee).toFixed(2)} Fee
                      {inv.items?.length > 0 && ` + ${inv.items.length} item(s)`}
                    </td>
                    <td style={{ fontWeight: 700 }}>${Number(inv.totalAmount).toFixed(2)}</td>
                    <td style={{ color: 'var(--success)', fontWeight: 600 }}>${Number(inv.paidAmount).toFixed(2)}</td>
                    <td style={{ color: Number(inv.balanceAmount) > 0 ? 'var(--danger)' : 'var(--text-muted)', fontWeight: 700 }}>
                      ${Number(inv.balanceAmount).toFixed(2)}
                    </td>
                    <td>
                      <StatusBadge status={inv.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        {Number(inv.balanceAmount) > 0 && inv.status !== 'CANCELLED' && (
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => openPayModal(inv)}
                          >
                            <DollarSign size={14} /> Pay Now
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => openPrint(inv)}
                        >
                          <Printer size={14} /> View / Print
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pay Now Modal */}
      <Modal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title={selectedInvoice ? `Pay Invoice #${selectedInvoice.invoiceNumber}` : 'Pay Invoice'}
      >
        {selectedInvoice && (
          <form onSubmit={handlePaymentSubmit}>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span>Invoice Total:</span>
                <strong>${Number(selectedInvoice.totalAmount).toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                <span>Paid So Far:</span>
                <span style={{ color: 'var(--success)' }}>${Number(selectedInvoice.paidAmount).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', marginTop: '0.35rem', color: 'var(--danger)', fontWeight: 800 }}>
                <span>Outstanding Balance:</span>
                <span>${Number(selectedInvoice.balanceAmount).toFixed(2)}</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Payment Amount ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={selectedInvoice.balanceAmount}
                className="form-control"
                required
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Select Payment Method *</label>
              <select
                className="form-control"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="CREDIT_CARD">Credit Card (Visa / Mastercard)</option>
                <option value="DEBIT_CARD">Debit Card</option>
                <option value="UPI">UPI Instant Payment</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => setPaymentModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submittingPayment}>
                {submittingPayment ? 'Processing...' : 'Complete Payment'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Invoice Print Modal */}
      <InvoicePrintModal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        invoice={selectedInvoice}
      />
    </div>
  );
}
