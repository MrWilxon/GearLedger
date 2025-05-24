
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { format } from 'date-fns';

export interface LogEntryData {
  action: string;
  details: string;
  user?: string;
}

export interface LogEntryType extends LogEntryData {
  id: string;
  timestamp: Date;
  user: string;
}

interface StoredLogEntryType extends Omit<LogEntryType, 'timestamp'> {
  timestamp: string;
}


interface LogContextType {
  logEntries: LogEntryType[];
  addLogEntry: (entryData: LogEntryData) => void;
}

const LOG_ENTRIES_STORAGE_KEY = "gearledger_log_entries";
const MAX_LOG_ENTRIES = 100;

const LogContext = createContext<LogContextType | undefined>(undefined);

export function LogProvider({ children }: { children: ReactNode }) {
  const [logEntries, setLogEntries] = useState<LogEntryType[]>([]);

  useEffect(() => {
    const storedLogEntries = localStorage.getItem(LOG_ENTRIES_STORAGE_KEY);
    if (storedLogEntries) {
      try {
        const parsedEntries = JSON.parse(storedLogEntries) as StoredLogEntryType[];
        setLogEntries(parsedEntries.map(entry => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
        })).slice(0, MAX_LOG_ENTRIES));
      } catch (error) {
        console.error("Failed to parse log entries from localStorage", error);
        setLogEntries([]);
      }
    } else {
      setLogEntries([]);
    }
  }, []);

  useEffect(() => {
    if (logEntries.length > 0 || localStorage.getItem(LOG_ENTRIES_STORAGE_KEY)) {
      const entriesToStore = logEntries.map(entry => ({
        ...entry,
        timestamp: entry.timestamp.toISOString(),
      }));
      localStorage.setItem(LOG_ENTRIES_STORAGE_KEY, JSON.stringify(entriesToStore));
    }
  }, [logEntries]);

  const addLogEntry = useCallback((entryData: LogEntryData) => {
    const newEntry: LogEntryType = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      user: entryData.user || "Admin",
      action: entryData.action,
      details: entryData.details,
    };
    setLogEntries(prevEntries => [newEntry, ...prevEntries].slice(0, MAX_LOG_ENTRIES));
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

    