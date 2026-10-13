import React, { useEffect, useState } from 'react';
import { Plus, CreditCard, Printer, DollarSign, Trash2, CheckCircle2 } from 'lucide-react';
import { billingService, patientService } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import InvoicePrintModal from '../../components/InvoicePrintModal';
import Alert from '../../components/Alert';

export default function BillingManagement() {
  const [invoices, setInvoices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [alert, setAlert] = useState(null);

  // New Invoice State
  const [newInvoice, setNewInvoice] = useState({
    patientId: '',
    consultationFee: 50.00,
    taxAmount: 5.00,
    discountAmount: 0.00,
    dueDate: '',
    items: [{ description: 'General Nursing & Bed Fee', amount: 35.00 }],
  });

  // Payment Form State
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [paymentNotes, setPaymentNotes] = useState('');

  useEffect(() => {
    patientService.getAll({ size: 100 })
      .then((res) => setPatients(res.data.content || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter, currentPage]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        size: 8,
        status: statusFilter || undefined,
      };
      const res = await billingService.getInvoices(params);
      setInvoices(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch (err) {
      console.error(err);
      setAlert({ type: 'error', message: 'Failed to load invoices.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setNewInvoice({
      ...newInvoice,
      items: [...newInvoice.items, { description: '', amount: 0.00 }],
    });
  };

  const handleRemoveItem = (index) => {
    const updated = newInvoice.items.filter((_, i) => i !== index);
    setNewInvoice({ ...newInvoice, items: updated });
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...newInvoice.items];
    updated[index][field] = field === 'amount' ? (parseFloat(value) || 0) : value;
    setNewInvoice({ ...newInvoice, items: updated });
  };

  const calculatePreviewTotal = () => {
    const itemsTotal = newInvoice.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const fee = parseFloat(newInvoice.consultationFee) || 0;
    const tax = parseFloat(newInvoice.taxAmount) || 0;
    const discount = parseFloat(newInvoice.discountAmount) || 0;
    return Math.max(0, fee + itemsTotal + tax - discount).toFixed(2);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await billingService.createInvoice(newInvoice);
      setAlert({ type: 'success', message: 'Invoice generated successfully.' });
      setCreateModalOpen(false);
      fetchInvoices();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create invoice.';
      setAlert({ type: 'error', message: msg });
    }
  };

  const openPaymentModal = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentAmount(invoice.balanceAmount > 0 ? invoice.balanceAmount : '');
    setPaymentMethod('CREDIT_CARD');
    setPaymentNotes('');
    setPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      await billingService.recordPayment(selectedInvoice.id, {
        amount: parseFloat(paymentAmount),
        paymentMethod,
        notes: paymentNotes,
      });
      setAlert({ type: 'success', message: `Payment of $${paymentAmount} processed successfully!` });
      setPaymentModalOpen(false);
      fetchInvoices();
    } catch (err) {
      const msg = err.response?.data?.message || 'Payment processing failed.';
      setAlert({ type: 'error', message: msg });
    }
  };

  const openPrintModal = (invoice) => {
    setSelectedInvoice(invoice);
    setPrintModalOpen(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Billing & Financial Center</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Manage itemized patient invoices, payment settlement transactions, and receipts
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setNewInvoice({
              patientId: patients[0]?.id || '',
              consultationFee: 50.00,
              taxAmount: 5.00,
              discountAmount: 0.00,
              dueDate: '',
              items: [{ description: 'General Nursing & Bed Fee', amount: 35.00 }],
            });
            setCreateModalOpen(true);
          }}
          id="btn-create-invoice"
        >
          <Plus size={16} /> Create Invoice
        </button>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Filter Bar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ maxWidth: '280px' }}>
          <label className="form-label">Payment Status</label>
          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(0); }}
            id="filter-invoice-status"
          >
            <option value="">All Invoices</option>
            <option value="UNPAID">Unpaid</option>
            <option value="PARTIALLY_PAID">Partially Paid</option>
            <option value="PAID">Paid</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Patient</th>
                <th>Issue Date</th>
                <th>Total ($)</th>
                <th>Paid ($)</th>
                <th>Balance ($)</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>Loading billing records...</td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No invoice records found.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td><span style={{ fontWeight: 700, color: 'var(--primary)' }}>#{inv.invoiceNumber}</span></td>
                    <td style={{ fontWeight: 600 }}>{inv.patientName}</td>
                    <td>{inv.issueDate}</td>
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
                        {inv.status !== 'PAID' && inv.status !== 'CANCELLED' && (
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => openPaymentModal(inv)}
                            title="Record Payment"
                          >
                            <DollarSign size={14} /> Pay
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => openPrintModal(inv)}
                          title="View / Print Invoice"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', padding: '1rem' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Previous
            </button>
            <span style={{ fontSize: '0.85rem', alignSelf: 'center', color: 'var(--text-muted)' }}>
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Create Invoice Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Generate New Hospital Invoice"
        maxWidth="680px"
      >
        <form onSubmit={handleCreateSubmit}>
          <div className="form-group">
            <label className="form-label">Patient *</label>
            <select
              className="form-control"
              required
              value={newInvoice.patientId}
              onChange={(e) => setNewInvoice({ ...newInvoice, patientId: e.target.value })}
            >
              <option value="">Select Patient</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.firstName} {p.lastName} (#{p.id} - {p.email})</option>
              ))}
            </select>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Physician Consultation Fee ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-control"
                required
                value={newInvoice.consultationFee}
                onChange={(e) => setNewInvoice({ ...newInvoice, consultationFee: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Due Date</label>
              <input
                type="date"
                className="form-control"
                value={newInvoice.dueDate}
                onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div style={{ margin: '1.25rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="form-label" style={{ margin: 0 }}>Itemized Clinical & Lab Charges</label>
              <button type="button" className="btn btn-outline btn-sm" onClick={handleAddItem}>
                <Plus size={14} /> Add Line Item
              </button>
            </div>

            {newInvoice.items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  className="form-control"
                  style={{ flex: 3 }}
                  placeholder="Charge Description (e.g. CBC Blood Work, MRI, Medication)"
                  value={item.description}
                  onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                  required
                />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-control"
                  style={{ flex: 1 }}
                  placeholder="Amount"
                  value={item.amount}
                  onChange={(e) => handleItemChange(idx, 'amount', e.target.value)}
                  required
                />
                {newInvoice.items.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ color: 'var(--danger)', padding: '0.5rem' }}
                    onClick={() => handleRemoveItem(idx)}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Tax Amount ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-control"
                value={newInvoice.taxAmount}
                onChange={(e) => setNewInvoice({ ...newInvoice, taxAmount: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Discount Amount ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-control"
                value={newInvoice.discountAmount}
                onChange={(e) => setNewInvoice({ ...newInvoice, discountAmount: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div style={{ background: 'var(--bg-muted)', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
            <span style={{ fontWeight: 700 }}>Calculated Net Total:</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>${calculatePreviewTotal()}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" id="btn-save-invoice">
              Issue Invoice
            </button>
          </div>
        </form>
      </Modal>

      {/* Record Payment Modal */}
      <Modal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title={selectedInvoice ? `Record Payment on Invoice #${selectedInvoice.invoiceNumber}` : 'Record Payment'}
      >
        {selectedInvoice && (
          <form onSubmit={handlePaymentSubmit}>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span>Patient:</span>
                <strong>{selectedInvoice.patientName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                <span>Total Invoice:</span>
                <strong>${Number(selectedInvoice.totalAmount).toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginTop: '0.25rem', color: 'var(--danger)', fontWeight: 700 }}>
                <span>Remaining Balance:</span>
                <strong>${Number(selectedInvoice.balanceAmount).toFixed(2)}</strong>
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
              <label className="form-label">Payment Method *</label>
              <select
                className="form-control"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="CREDIT_CARD">Credit Card (Visa / MC)</option>
                <option value="DEBIT_CARD">Debit Card</option>
                <option value="UPI">UPI / Instant Bank Transfer</option>
                <option value="CASH">Cash Payment</option>
                <option value="INSURANCE">Insurance Claim</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Payment Notes / Transaction Memo</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Pos Terminal Terminal-04, Patient Receipt #48"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => setPaymentModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" id="btn-submit-payment">
                Process Payment
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Printable Invoice View */}
      <InvoicePrintModal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        invoice={selectedInvoice}
      />
    </div>
  );
}
