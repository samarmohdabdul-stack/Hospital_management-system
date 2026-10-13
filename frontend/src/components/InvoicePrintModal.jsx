import React from 'react';
import Modal from './Modal';
import StatusBadge from './StatusBadge';
import { Printer, Cross } from 'lucide-react';

export default function InvoicePrintModal({ isOpen, onClose, invoice }) {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invoice & Billing Statement" maxWidth="750px">
      <div id="printable-invoice" style={{ padding: '0.5rem' }}>
        {/* Hospital Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--border-color)', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 800, fontSize: '1.35rem' }}>
              <Cross size={24} /> CarePoint Memorial Hospital
            </div>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              100 Hospital Parkway, Suite 500<br />
              Healthcare City, HC 12345 | Tel: +1 (555) 010-CARE
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>INVOICE</h2>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)', marginTop: '0.25rem' }}>
              #{invoice.invoiceNumber}
            </div>
            <div style={{ marginTop: '0.4rem' }}>
              <StatusBadge status={invoice.status} />
            </div>
          </div>
        </div>

        {/* Invoice Meta Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>BILLED TO:</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '0.25rem' }}>{invoice.patientName || 'Patient'}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Patient ID: #{invoice.patientId}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Issue Date: </span>
              <strong>{invoice.issueDate}</strong>
            </div>
            {invoice.dueDate && (
              <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Due Date: </span>
                <strong>{invoice.dueDate}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Itemized Table */}
        <table className="table" style={{ marginBottom: '1.5rem' }}>
          <thead>
            <tr>
              <th>Description</th>
              <th style={{ textAlign: 'right' }}>Amount ($)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Physician Consultation Fee</td>
              <td style={{ textAlign: 'right' }}>${Number(invoice.consultationFee || 0).toFixed(2)}</td>
            </tr>
            {invoice.items && invoice.items.map((item, idx) => (
              <tr key={idx}>
                <td>{item.description}</td>
                <td style={{ textAlign: 'right' }}>${Number(item.amount || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total Calculation Breakdown */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
          <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Tax:</span>
              <span>+${Number(invoice.taxAmount || 0).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Discount:</span>
              <span style={{ color: 'var(--success)' }}>-${Number(invoice.discountAmount || 0).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--border-color)', paddingTop: '0.5rem', fontWeight: 800, fontSize: '1.15rem' }}>
              <span>Total Amount:</span>
              <span style={{ color: 'var(--primary)' }}>${Number(invoice.totalAmount || 0).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)', fontWeight: 600 }}>
              <span>Paid So Far:</span>
              <span>${Number(invoice.paidAmount || 0).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: Number(invoice.balanceAmount) > 0 ? 'var(--danger)' : 'var(--text-muted)', fontWeight: 700 }}>
              <span>Remaining Balance:</span>
              <span>${Number(invoice.balanceAmount || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment History Log */}
        {invoice.payments && invoice.payments.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>Payment Transactions</h4>
            {invoice.payments.map((p) => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', padding: '0.4rem 0', borderBottom: '1px dashed var(--border-color)' }}>
                <span>TXN: {p.transactionId} ({p.paymentMethod})</span>
                <span style={{ color: 'var(--success)', fontWeight: 600 }}>${Number(p.amount).toFixed(2)} ({p.status})</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="no-print">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            * This is a computer generated medical invoice.
          </span>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Close
            </button>
            <button type="button" className="btn btn-primary" onClick={handlePrint} id="btn-print-invoice">
              <Printer size={16} /> Print / Save PDF
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
