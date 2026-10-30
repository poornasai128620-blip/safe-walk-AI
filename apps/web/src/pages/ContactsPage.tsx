import React, { useEffect, useState } from 'react';
import { Users, Plus, Trash2, CheckCircle2, Shield, Phone, Mail, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { TrustedContact } from '@safewalk/shared-types';

export const ContactsPage: React.FC = () => {
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [contactName, setContactName] = useState('');
  const [relationship, setRelationship] = useState('Family');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadContacts = async () => {
    try {
      const data = await api.getContacts();
      setContacts(data);
    } catch (err) {
      console.error('Failed to load contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.addContact({
        contact_name: contactName,
        relationship,
        phone_number: phone,
        email: email || null,
        notification_preferences: { sms: true, email: true, push: true }
      });
      setShowAddModal(false);
      setContactName('');
      setPhone('');
      setEmail('');
      await loadContacts();
    } catch (err: any) {
      alert(`Failed to add contact: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm('Remove this emergency contact?')) return;
    try {
      await api.deleteContact(id);
      await loadContacts();
    } catch (err: any) {
      alert(`Failed to delete: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-emergency-500" />
            <span>Trusted Emergency Contacts</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified individuals who receive immediate SMS, Email, and live GPS tracking links when you trigger an SOS
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 rounded-xl bg-emergency-600 hover:bg-emergency-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-emergency-600/30 transition-transform active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Emergency Contact</span>
        </button>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contacts.map((c) => (
          <div key={c.id} className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold text-[10px] uppercase font-mono">
                  {c.relationship || 'Emergency Contact'}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>VERIFIED</span>
                </span>
              </div>

              <h4 className="text-sm font-bold text-white">{c.contact_name}</h4>

              <div className="mt-3 space-y-1.5 text-xs text-slate-400">
                <p className="flex items-center gap-2 font-mono">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>{c.phone_number}</span>
                </p>
                {c.email && (
                  <p className="flex items-center gap-2 font-mono">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>{c.email}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[10px] text-slate-500">Alerts: SMS • Email • Push</span>
              <button
                onClick={() => handleDeleteContact(c.id)}
                className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                title="Remove Contact"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel-elevated p-6 rounded-3xl border border-slate-700/80 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Add Trusted Contact</h3>
            <p className="text-xs text-slate-400 mb-4">This person will be instantly alerted with your live location during an SOS.</p>

            <form onSubmit={handleAddContact} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Contact Full Name</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Rohit Sharma"
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Relationship</label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Family">Family / Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Spouse">Spouse / Partner</option>
                  <option value="Friend">Friend / Roommate</option>
                  <option value="Guardian">Legal Guardian</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+919812345678"
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Email Address (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rohit@example.com"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-emergency-600 hover:bg-emergency-500 text-white font-bold uppercase tracking-wider"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
