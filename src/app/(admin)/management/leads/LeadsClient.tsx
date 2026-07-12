"use client";

import { useState } from "react";
import { updateLeadStatus, deleteLead } from "./actions";
import { Button } from "@/components/ui/button";
import { Trash2, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";

type Lead = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  status: string;
  createdAt: Date;
};

export default function LeadsClient({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState(initialLeads);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateLeadStatus(id, newStatus);
      setLeads(leads.map(l => l.id === id ? { ...l, status: newStatus } : l));
      toast.success(`Lead status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update lead status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    try {
      await deleteLead(id);
      setLeads(leads.filter(l => l.id !== id));
      toast.success("Lead deleted successfully");
    } catch (error) {
      toast.error("Failed to delete lead");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-navy dark:text-white">Leads Management</h1>
          <p className="text-slate-500 dark:text-slate-400">View and manage placement test registrations</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="p-4 font-medium text-slate-500 dark:text-slate-400">Name</th>
                <th className="p-4 font-medium text-slate-500 dark:text-slate-400">Contact</th>
                <th className="p-4 font-medium text-slate-500 dark:text-slate-400">Program Interest</th>
                <th className="p-4 font-medium text-slate-500 dark:text-slate-400">Date</th>
                <th className="p-4 font-medium text-slate-500 dark:text-slate-400">Status</th>
                <th className="p-4 font-medium text-slate-500 dark:text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No leads found.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-medium text-navy dark:text-slate-200">{lead.name}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">
                      <div>{lead.phone}</div>
                      {lead.email && <div className="text-sm">{lead.email}</div>}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">
                      {lead.message?.replace("Interested in: ", "")}
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400 text-sm" suppressHydrationWarning>
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        lead.status === 'contacted' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {lead.status === 'contacted' ? 'Contacted' : 'New'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {lead.status === 'new' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleStatusChange(lead.id, 'contacted')}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 h-8 px-2"
                            title="Mark as Contacted"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {lead.status === 'contacted' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleStatusChange(lead.id, 'new')}
                            className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 h-8 px-2"
                            title="Mark as New"
                          >
                            <Clock className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(lead.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 px-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
