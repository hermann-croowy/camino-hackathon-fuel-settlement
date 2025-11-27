import React from 'react';
import { useViewMode } from '../context/ViewModeContext';
import { MdFlight, MdLocalGasStation } from 'react-icons/md';

const ViewModeToggle = () => {
    const { viewMode, toggleViewMode, isAirline, isSupplier } = useViewMode();

    return (
        <div className="flex items-center gap-2">
            <div 
                className="relative flex items-center bg-white/30 backdrop-blur-sm rounded-full p-1 cursor-pointer border border-black/10"
                onClick={toggleViewMode}
            >
                {/* Sliding background indicator */}
                <div 
                    className={`absolute h-[calc(100%-8px)] w-[calc(50%-2px)] bg-[#FCCC04] rounded-full transition-all duration-300 ease-in-out shadow-md ${
                        isAirline ? 'left-1' : 'left-[calc(50%)]'
                    }`}
                />
                
                {/* Airline option */}
                <div 
                    className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors duration-300 ${
                        isAirline ? 'text-black font-semibold' : 'text-black/60'
                    }`}
                >
                    <MdFlight className={`text-lg transition-transform ${isAirline ? 'rotate-0' : '-rotate-45'}`} />
                    <span className="text-sm vueling-lowercase">airline</span>
                </div>
                
                {/* Supplier option */}
                <div 
                    className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors duration-300 ${
                        isSupplier ? 'text-black font-semibold' : 'text-black/60'
                    }`}
                >
                    <MdLocalGasStation className="text-lg" />
                    <span className="text-sm vueling-lowercase">supplier</span>
                </div>
            </div>
        </div>
    );
};

export default ViewModeToggle;

