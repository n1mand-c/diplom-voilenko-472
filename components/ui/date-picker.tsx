"use client";

import * as React from "react";
import { format, setMonth, setYear } from "date-fns";
import { uk } from 'date-fns/locale';
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";

const MONTHS = [
  "Січень","Лютий","Березень","Квітень","Травень","Червень",
  "Липень","Серпень","Вересень","Жовтень","Листопад","Грудень"
];

const selectStyle: React.CSSProperties = {
  background: "#0f0f1a",
  color: "#ffffff",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "8px",
  padding: "4px 8px",
  fontSize: "13px",
  outline: "none",
  cursor: "pointer",
  flex: 1,
};

export function DatePicker({
  date,
  setDate,
  placeholder = "Оберіть дату",
  className,
}: {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [viewMonth, setViewMonth] = React.useState<Date>(date ?? new Date());
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (date) setViewMonth(date);
  }, [date]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 text-left outline-none focus:border-[#C8102E]/50 flex items-center justify-between transition-colors",
          !date ? "text-white/50" : "text-white",
          className
        )}
      >
        <span>
          {date ? format(date, "PPP", { locale: uk }) : placeholder}
        </span>
        <CalendarIcon className="h-4 w-4 text-white/50" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 z-50 rounded-xl border border-white/10 bg-[#0A0A0F] shadow-2xl overflow-hidden min-w-[280px]">
          {/* Custom month/year selectors */}
          <div className="flex gap-2 px-3 pt-3 pb-1">
            <select
              style={selectStyle}
              value={viewMonth.getMonth()}
              onChange={(e) => setViewMonth(setMonth(viewMonth, Number(e.target.value)))}
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i} style={{ background: "#0f0f1a", color: "#fff" }}>{m}</option>
              ))}
            </select>
            <select
              style={selectStyle}
              value={viewMonth.getFullYear()}
              onChange={(e) => setViewMonth(setYear(viewMonth, Number(e.target.value)))}
            >
              {years.map((y) => (
                <option key={y} value={y} style={{ background: "#0f0f1a", color: "#fff" }}>{y}</option>
              ))}
            </select>
          </div>

          <Calendar
            mode="single"
            selected={date}
            month={viewMonth}
            onMonthChange={setViewMonth}
            onSelect={(d: Date | undefined) => {
              setDate(d);
              setIsOpen(false);
            }}
            initialFocus
          />
        </div>
      )}
    </div>
  );
}

