"use client";

import React, { useState, useMemo } from "react";
import { useStore } from "@/store/useStore";
import { useTranslation } from "@/hooks/useTranslation";
import { formatDate } from "@/lib/utils";
import {
  Search,
  Trash2,
  Download,
  Clock,
  User,
  Shield,
  FileText,
  AlertTriangle,
} from "lucide-react";

export default function LogsPage() {
  const { t, isRTL } = useTranslation();
  const { activityLogs, clearActivityLogs, role } = useStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<string>("all");

  // Get a unique list of userNames from the logs
  const uniqueUsers = useMemo(() => {
    const users = new Set<string>();
    activityLogs.forEach((log) => {
      if (log.userName) {
        users.add(log.userName);
      }
    });
    return Array.from(users);
  }, [activityLogs]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return activityLogs.filter((log) => {
      const matchesSearch = log.action.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesUser = selectedUser === "all" || log.userName === selectedUser;
      return matchesSearch && matchesUser;
    });
  }, [activityLogs, searchQuery, selectedUser]);

  const handleClearLogs = () => {
    if (confirm(t("log_clear_confirm"))) {
      clearActivityLogs();
    }
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(activityLogs, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `System_Audit_Logs_${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">{t("log_title")}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t("log_desc")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportJSON}
            className="flex items-center justify-center gap-2 border border-border bg-card font-bold px-4 py-2.5 rounded-xl hover:bg-muted text-xs transition-all cursor-pointer"
            title="Download Logs as JSON"
          >
            <Download className="h-4 w-4" />
            <span>{t("btn_download")}</span>
          </button>
          {role === "admin" && (
            <button
              onClick={handleClearLogs}
              disabled={activityLogs.length === 0}
              className="flex items-center justify-center gap-2 bg-destructive text-destructive-foreground disabled:opacity-50 font-bold px-4 py-2.5 rounded-xl shadow-md hover:scale-[1.01] text-xs transition-all cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              <span>{t("log_clear")}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Search */}
        <div className="sm:col-span-2 relative">
          <Search className={`absolute top-3 h-4 w-4 text-muted-foreground ${isRTL ? "right-4" : "left-4"}`} />
          <input
            type="text"
            placeholder="Search action details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full bg-card border border-border rounded-xl py-2 px-10 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary ${isRTL ? "pr-10 pl-4" : "pl-10 pr-4"}`}
          />
        </div>

        {/* User Filter */}
        <div className="relative">
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full bg-card border border-border rounded-xl py-2 px-4 text-sm focus:outline-none focus:border-primary"
          >
            <option value="all">All Users / Operators</option>
            {uniqueUsers.map((usr) => (
              <option key={usr} value={usr}>
                {usr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table Card */}
      <div className="p-6 bg-card border border-border rounded-3xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-foreground border-collapse">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider font-semibold bg-muted/20">
                <th className="px-6 py-4 w-48">{t("log_timestamp")}</th>
                <th className="px-6 py-4 w-48">{t("log_user")}</th>
                <th className="px-6 py-4">{t("log_action")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground italic">
                    {t("no_data")}
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const logDate = new Date(log.timestamp);
                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-primary" />
                          <span>
                            {logDate.toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}{" "}
                            {logDate.toLocaleTimeString(undefined, {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <User className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <p className="font-semibold text-xs text-foreground">{log.userName}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">ID: {log.userId.substring(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium leading-relaxed break-words text-foreground">
                          {log.action}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
