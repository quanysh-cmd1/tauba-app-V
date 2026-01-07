import React, { useState } from 'react';
import { City, Language } from '../types';
import { CITY_DATABASE } from '../constants';
import { X, Save, RefreshCw, Database, ShieldAlert } from 'lucide-react';

interface AdminViewProps {
  lang: Language;
  onClose: () => void;
}

const AdminView: React.FC<AdminViewProps> = ({ lang, onClose }) => {
  const [cities, setCities] = useState<City[]>(CITY_DATABASE);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCities = cities.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.id.toString().includes(searchTerm)
  );

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="w-full max-w-5xl h-[90vh] sm:h-[85vh] bg-deep-950 rounded-[2rem] sm:rounded-[3rem] border border-white/10 shadow-3xl flex flex-col overflow-hidden animate-ios-spring">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Admin Panel</h2>
              <p className="text-xs text-white/40 uppercase tracking-widest font-bold">System Management</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Total Cities</div>
              <div className="text-2xl font-black text-white">{cities.length}</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">API Status</div>
              <div className="text-2xl font-black text-emerald-400">Online</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Database</div>
              <div className="text-2xl font-black text-blue-400">Muftyat v2</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Database size={18} className="text-emerald-400" />
                City Database
              </h3>
              <div className="relative w-full sm:w-64">
                <input 
                  type="text" 
                  placeholder="Search cities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 w-full"
                />
              </div>
            </div>

            <div className="border border-white/5 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-white/40 uppercase text-[10px] font-black tracking-widest">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Coordinates</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredCities.slice(0, 50).map(city => (
                    <tr key={city.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-mono text-emerald-400">{city.id}</td>
                      <td className="px-4 py-3 font-bold text-white">{city.title}</td>
                      <td className="px-4 py-3 text-white/60 text-xs">{city.lat}, {city.lng}</td>
                      <td className="px-4 py-3 text-right">
                        <button className="p-2 text-white/40 hover:text-emerald-400 transition-colors">
                          <Save size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredCities.length > 50 && (
                <div className="p-4 text-center text-white/20 text-xs italic">
                  Showing first 50 of {filteredCities.length} cities...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white/5 border-t border-white/5 flex justify-end gap-3">
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all">
            <RefreshCw size={18} />
            Sync with API
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20">
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminView;
