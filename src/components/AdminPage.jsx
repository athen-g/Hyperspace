import React, { useState, useEffect } from 'react';
import Header from './Header';
import BackgroundLines from './ui/BackgroundLines';
import Footer from './Footer';
import { adminSupabase } from '../lib/adminClient';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function AdminPage() {
  const [passphrase, setPassphrase] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('all');

  const adminPass = import.meta.env.VITE_ADMIN_PASS || 'hyperspace2026';

  const handleLogin = (e) => {
    e.preventDefault();
    if (passphrase === adminPass) {
      setIsAuthenticated(true);
      setErrorMsg('');
    } else {
      setErrorMsg('Incorrect passphrase. Please try again.');
    }
  };

  const fetchRegistrations = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { data, error } = await adminSupabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load registrations: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchRegistrations();
    }
  }, [isAuthenticated]);

  // Extract unique events in the registrations list for filtering
  const uniqueEvents = ['all', ...new Set(registrations.map(r => r.event_slug))];

  const filteredRegistrations = selectedEvent === 'all'
    ? registrations
    : registrations.filter(r => r.event_slug === selectedEvent);

  // Convert Dynamic JSON answers to printable strings
  const formatExtraAnswers = (answers) => {
    if (!answers || typeof answers !== 'object') return '';
    return Object.entries(answers)
      .map(([key, val]) => `${key.replace(/_/g, ' ').toUpperCase()}: ${val}`)
      .join('\n');
  };

  // Export to CSV (native opening in Google Sheets)
  const downloadCSV = () => {
    if (filteredRegistrations.length === 0) return;

    // Header fields
    const headers = ['ID', 'Registration Date', 'Event Slug', 'Name', 'Email', 'Contact No.', 'Class', 'Division', 'Additional Answers'];
    
    const rows = filteredRegistrations.map(r => [
      r.id,
      new Date(r.created_at).toLocaleString(),
      r.event_slug,
      r.name,
      r.email,
      r.contact,
      r.class,
      r.division,
      formatExtraAnswers(r.extra_answers).replace(/\n/g, ' | ')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `registrations_${selectedEvent}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF
  const downloadPDF = () => {
    if (filteredRegistrations.length === 0) return;

    const doc = new jsPDF('landscape');
    doc.text(`Hyperspace Event Registrations - ${selectedEvent.toUpperCase()}`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 22);

    const tableHeaders = [['Name', 'Email', 'Contact', 'Class', 'Division', 'Event', 'Additional Q&A']];
    const tableData = filteredRegistrations.map(r => [
      r.name,
      r.email,
      r.contact,
      r.class,
      r.division,
      r.event_slug,
      formatExtraAnswers(r.extra_answers)
    ]);

    doc.autoTable({
      head: tableHeaders,
      body: tableData,
      startY: 28,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
      columnStyles: {
        6: { cellWidth: 80 } // Give Q&A column more space
      }
    });

    doc.save(`registrations_${selectedEvent}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (!isAuthenticated) {
    return (
      <section className="min-h-screen flex flex-col justify-between">
        <Header />
        <BackgroundLines />
        <div className="flex-grow flex items-center justify-center relative z-10 px-4">
          <div className="w-full max-w-md p-8 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md shadow-2xl">
            <h2 className="font-host text-white text-2xl font-bold mb-6 text-center tracking-wider">ADMIN PORTAL</h2>
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-mono text-xs text-white/60 tracking-widest uppercase">Admin Passphrase</label>
                <input
                  type="password"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg py-3 px-4 text-white placeholder-white/20 focus:outline-none focus:border-accent-pink/50 transition-colors"
                  required
                />
              </div>
              {errorMsg && (
                <p className="font-mono text-xs text-accent-pink mt-1">{errorMsg}</p>
              )}
              <button
                type="submit"
                className="mt-4 bg-accent-pink text-white font-bold py-3 rounded-lg hover:bg-opacity-95 transition-all shadow-lg shadow-accent-pink/25 tracking-widest uppercase text-xs"
              >
                Unlock Dashboard
              </button>
            </form>
          </div>
        </div>
        <Footer />
      </section>
    );
  }

  return (
    <section className="min-h-screen flex flex-col justify-between">
      <Header />
      <BackgroundLines />
      <div className="flex-grow relative z-10 w-[93.056%] mx-auto mt-[100px] mb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#2D2D2D] pb-6 mb-8 gap-4">
          <div>
            <h1 className="font-host text-white text-3xl font-extrabold tracking-tight uppercase">Registrations Dashboard</h1>
            <p className="font-mono text-xs text-white/50 mt-1 uppercase tracking-wider">Club Registration Management Panel</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center bg-white/[0.03] border border-white/10 rounded-lg px-3 py-1.5">
              <span className="font-mono text-xs text-white/40 mr-2 uppercase">Filter:</span>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="bg-transparent text-white font-mono text-xs focus:outline-none cursor-pointer"
              >
                {uniqueEvents.map(slug => (
                  <option key={slug} value={slug} className="bg-[#0e0e0e] text-white">
                    {slug.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={downloadCSV}
              disabled={filteredRegistrations.length === 0}
              className="bg-white/10 border border-white/20 text-white font-mono text-xs font-bold px-4 py-2 rounded-lg hover:bg-white/20 transition-all uppercase tracking-wider disabled:opacity-50"
            >
              Google Sheets (CSV)
            </button>
            <button
              onClick={downloadPDF}
              disabled={filteredRegistrations.length === 0}
              className="bg-accent-pink text-white font-mono text-xs font-bold px-4 py-2 rounded-lg hover:bg-opacity-95 transition-all shadow-md shadow-accent-pink/20 uppercase tracking-wider disabled:opacity-50"
            >
              PDF Table
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-accent-pink/10 border border-accent-pink/30 rounded-xl p-4 mb-6">
            <p className="font-mono text-xs text-accent-pink">{errorMsg}</p>
          </div>
        )}

        <div className="overflow-hidden border border-white/10 rounded-xl bg-white/[0.02] backdrop-blur-sm">
          {loading ? (
            <div className="py-20 text-center">
              <span className="font-mono text-xs text-white/50 uppercase tracking-widest animate-pulse">Loading Registrations...</span>
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-mono text-xs text-white/40 uppercase tracking-widest">No registrations found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] font-mono text-[10px] tracking-widest text-white/60 uppercase">
                    <th className="py-4 px-6">Name</th>
                    <th className="py-4 px-6">Email</th>
                    <th className="py-4 px-6">Contact</th>
                    <th className="py-4 px-6">Class</th>
                    <th className="py-4 px-6">Div</th>
                    <th className="py-4 px-6">Event</th>
                    <th className="py-4 px-6 w-[350px]">Additional Answers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans text-xs text-white/80">
                  {filteredRegistrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6 font-semibold text-white">{reg.name}</td>
                      <td className="py-4 px-6 font-mono text-white/70">{reg.email}</td>
                      <td className="py-4 px-6 font-mono">{reg.contact}</td>
                      <td className="py-4 px-6">{reg.class}</td>
                      <td className="py-4 px-6">{reg.division}</td>
                      <td className="py-4 px-6 font-mono text-[10px] bg-white/[0.03] px-2 py-1 rounded inline-block my-3">{reg.event_slug}</td>
                      <td className="py-4 px-6 font-mono text-[10px] text-white/60 whitespace-pre-line leading-relaxed">
                        {formatExtraAnswers(reg.extra_answers)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </section>
  );
}
