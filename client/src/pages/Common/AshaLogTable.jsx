import { useState, useMemo } from "react";
import { Search, Calendar, AlertCircle, CheckCircle2 } from "lucide-react";

export const AshaLogTable = ({ logs }) => {
  const [search, setSearch] = useState("");

  const filteredLogs = useMemo(() => {
    return logs.filter((log) =>
      `${log.beneficiary} ${log.visit} ${log.ashaName}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [logs, search]);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search beneficiary / visit / ASHA"
          className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-3 text-left">Date</th>
              <th className="px-6 py-3 text-left">Beneficiary</th>
              <th className="px-6 py-3 text-left">ASHA</th>
              <th className="px-6 py-3 text-left">Visit</th>
              <th className="px-6 py-3 text-left">Phase</th>
              <th className="px-6 py-3 text-left">Month</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Timing</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {filteredLogs.map((log, i) => (
              <tr
                key={i}
                className={log.isAlert ? "bg-red-50/40" : "hover:bg-gray-50"}
              >
                <td className="px-6 py-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {new Date(log.date).toLocaleDateString("en-IN")}
                  </div>
                </td>

                <td className="px-6 py-4 font-medium">
                  {log.beneficiary}
                </td>

                <td className="px-6 py-4 text-sm">
                  {log.ashaName}
                </td>

                <td className="px-6 py-4">
                  <div className="font-medium">{log.visit}</div>
                </td>

                <td className="px-6 py-4 text-xs font-semibold">
                  {log.phase}
                </td>

                <td className="px-6 py-4 text-sm">
                  {log.month === "N/A" ? "-" : `Month ${log.month}`}
                </td>

                <td className="px-6 py-4">
                  <StatusBadge status={log.status} />
                </td>

                <td className="px-6 py-4">
                  <TimingBadge timing={log.timing} />
                </td>
              </tr>
            ))}

            {filteredLogs.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center py-10 text-gray-400">
                  No logs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};


// Helper for Status (Completed, Missed, Planned)
const StatusBadge = ({ status }) => {
  const styles = {
    Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Missed: "bg-rose-50 text-rose-700 border-rose-200",
    Planned: "bg-amber-50 text-amber-700 border-amber-200",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${styles[status] || styles.Planned}`}>
      {status === 'Completed' ? (
        <CheckCircle2 className="w-3 h-3" />
      ) : (
        <AlertCircle className="w-3 h-3" />
      )}
      {status}
    </span>
  );
};

// Helper for Timing (Within Date, Overdue)
const TimingBadge = ({ timing }) => {
  const isOverdue = timing === 'Overdue';
  
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${isOverdue ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
      <span className={`text-xs font-bold uppercase tracking-wide ${isOverdue ? 'text-rose-600' : 'text-emerald-600'}`}>
        {timing}
      </span>
    </div>
  );
};

