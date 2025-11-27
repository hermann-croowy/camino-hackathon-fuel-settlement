// Mock database of 20 Vueling flights and aircraft
// Flight codes use Vueling's VY prefix
// Plane IDs use Spanish aircraft registration format (EC-XXX)

export const VUELING_FLIGHTS = [
    { flight: 'VY1001', planeId: 'EC-MXA' },
    { flight: 'VY1234', planeId: 'EC-MKN' },
    { flight: 'VY2015', planeId: 'EC-NAJ' },
    { flight: 'VY3201', planeId: 'EC-LVT' },
    { flight: 'VY1502', planeId: 'EC-MGY' },
    { flight: 'VY4321', planeId: 'EC-NBF' },
    { flight: 'VY2789', planeId: 'EC-LQM' },
    { flight: 'VY1876', planeId: 'EC-MJB' },
    { flight: 'VY3045', planeId: 'EC-NAZ' },
    { flight: 'VY2100', planeId: 'EC-LVS' },
    { flight: 'VY1623', planeId: 'EC-MKX' },
    { flight: 'VY4502', planeId: 'EC-NCH' },
    { flight: 'VY2834', planeId: 'EC-LQN' },
    { flight: 'VY1945', planeId: 'EC-MJC' },
    { flight: 'VY3178', planeId: 'EC-NBG' },
    { flight: 'VY2267', planeId: 'EC-LVU' },
    { flight: 'VY1789', planeId: 'EC-MKY' },
    { flight: 'VY4123', planeId: 'EC-NCI' },
    { flight: 'VY2901', planeId: 'EC-LQP' },
    { flight: 'VY1456', planeId: 'EC-MJD' },
];

// Helper function to get flight data for an order (cycles through the 20 entries)
export const getFlightDataForOrder = (orderId) => {
    const index = orderId % VUELING_FLIGHTS.length;
    return VUELING_FLIGHTS[index];
};

