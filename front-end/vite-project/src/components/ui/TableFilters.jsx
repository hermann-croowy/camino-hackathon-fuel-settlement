import React from 'react';
import { cn } from '@/lib/utils';

const STATUS_OPTIONS = [
    { value: '', label: 'All Statuses' },
    { value: '0', label: 'Created' },
    { value: '1', label: 'Delivered' },
    { value: '2', label: 'Settled' },
    { value: '3', label: 'Cancelled' },
    { value: '4', label: 'Declined' },
];

const StatusFilter = ({ value, onChange, className }) => {
    return (
        <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value || undefined)}
            className={cn(
                "px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white/70 text-black",
                "focus:outline-none focus:ring-2 focus:ring-[#FCCC04]/50 focus:border-[#FCCC04]",
                "cursor-pointer",
                className
            )}
        >
            {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
};

const AddressFilter = ({ value, onChange, placeholder, className }) => {
    return (
        <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value || undefined)}
            placeholder={placeholder}
            className={cn(
                "px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white/70 text-black",
                "focus:outline-none focus:ring-2 focus:ring-[#FCCC04]/50 focus:border-[#FCCC04]",
                "placeholder:text-black/40",
                className
            )}
        />
    );
};

const QuickFilterButton = ({ active, onClick, children, className }) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                active
                    ? "bg-[#FCCC04] text-black border-2 border-[#FCCC04]"
                    : "bg-white/70 text-black/70 border border-gray-200 hover:border-[#FCCC04]/50 hover:bg-[#FCCC04]/10",
                className
            )}
        >
            {children}
        </button>
    );
};

const FilterBar = ({ children, className }) => {
    return (
        <div className={cn("flex flex-wrap items-center gap-3 mb-4", className)}>
            {children}
        </div>
    );
};

const FilterLabel = ({ children }) => {
    return (
        <span className="text-sm text-black/60 font-medium">
            {children}
        </span>
    );
};

export { StatusFilter, AddressFilter, QuickFilterButton, FilterBar, FilterLabel, STATUS_OPTIONS };

