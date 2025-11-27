import React, { createContext, useState, useEffect, useContext } from 'react';

export const ViewModeContext = createContext();

const STORAGE_KEY = 'fuel-settlement-view-mode';

export const ViewModeProvider = ({ children }) => {
    const [viewMode, setViewMode] = useState(() => {
        // Initialize from localStorage or default to 'airline'
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved === 'supplier' ? 'supplier' : 'airline';
    });

    // Persist to localStorage whenever viewMode changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, viewMode);
    }, [viewMode]);

    const toggleViewMode = () => {
        setViewMode(prev => prev === 'airline' ? 'supplier' : 'airline');
    };

    const setAirlineMode = () => setViewMode('airline');
    const setSupplierMode = () => setViewMode('supplier');

    const isAirline = viewMode === 'airline';
    const isSupplier = viewMode === 'supplier';

    return (
        <ViewModeContext.Provider value={{
            viewMode,
            toggleViewMode,
            setAirlineMode,
            setSupplierMode,
            isAirline,
            isSupplier
        }}>
            {children}
        </ViewModeContext.Provider>
    );
};

// Custom hook for easier access
export const useViewMode = () => {
    const context = useContext(ViewModeContext);
    if (!context) {
        throw new Error('useViewMode must be used within a ViewModeProvider');
    }
    return context;
};

