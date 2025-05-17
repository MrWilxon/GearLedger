
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useCallback } from 'react';

export interface LogEntryData {
  action: string; // e.g., "Created Expense", "Updated Stock Item"
  details: string; // e.g., "Expense: Rent for October", "Item: Premium Chain Lube, Quantity: 48"
  user?: string; // Optional, defaults to "Admin"
}

export interface LogEntryType extends LogEntryData {
  id: string;
  timestamp: Date;
  user: string;
}

interface LogContextType {
  logEntries: LogEntryType[];
  addLogEntry: (entryData: LogEntryData) => void;
}

const LogContext = createContext<LogContextType | undefined>(undefined);

export function LogProvider({ children }: { children: ReactNode }) {
  const [logEntries, setLogEntries] = useState<LogEntryType[]>([]);

  const addLogEntry = useCallback((entryData: LogEntryData) => {
    const newEntry: LogEntryType = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      user: entryData.user || "Admin", // Default user
      action: entryData.action,
      details: entryData.details,
    };
    // Add new entry to the beginning and keep a maximum of 50 entries
    setLogEntries(prevEntries => [newEntry, ...prevEntries].slice(0, 50));
  }, []);

  return (
    <LogContext.Provider value={{ logEntries, addLogEntry }}>
      {children}
    </LogContext.Provider>
  );
}

export function useLog(): LogContextType {
  const context = useContext(LogContext);
  if (context === undefined) {
    throw new Error('useLog must be used within a LogProvider');
  }
  return context;
}
