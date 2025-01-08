export interface BagTagModel {
    version: number;
    lpn?: string;
    uuid?: string;
    flights: BagTagFlightLegModel[];
}

export interface BagTagFlightLegModel {
    designator: string;
    flightNumber: number;
    dateOfFlight: Date;
    departureAirport: string;
    arrivalAirport: string;
}