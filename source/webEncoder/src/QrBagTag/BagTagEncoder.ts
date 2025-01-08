import { BagTagModel } from "./BagTagModel";
import * as base45 from 'base45';
import { parse as uuidParse } from 'uuid';

declare const Buffer: any;

export class BagTagEncoder {


    public encodeInBytes(data: BagTagModel): Uint8Array {
        let dataBytes = new Uint8Array(600);
        let currentByteIndex = 0;

        /* First Byte - Version, P1, P2 and flight Legs */
        const numberOfFlightLegs = data.flights.length;
        const p1 = (data.lpn == null) ? 0 : 1;
        const p2 = (data.uuid == null) ? 0 : 1;

        dataBytes[currentByteIndex++] = data.version << 5 | p1 << 4 | p2 << 3 | ((numberOfFlightLegs - 1) & 0x7);

        /* License Plate Bytes */
        if (data.lpn != null) {
            if (data.lpn?.length != 10) {
                throw new RangeError('Given License Plate Number does not equals 10 characters!');
            }

            for (let lpnIndex = 0; lpnIndex < 5; lpnIndex++) {
                const firstNumericChar = data.lpn?.substring(lpnIndex * 2, lpnIndex * 2 + 1);
                const secondNumericChar = data.lpn?.substring(lpnIndex * 2 + 1, lpnIndex * 2 + 2);
                const firstNumericCharValue = this.codesetNumeric(firstNumericChar);
                const secondNumericCharValue = this.codesetNumeric(secondNumericChar);
                dataBytes[currentByteIndex++] = firstNumericCharValue << 4 | secondNumericCharValue;
            }
        }

        /* Copy UUID to Databytes */
        if (data.uuid != null) {
            const uuidByteBuffer = this.uuidToBuffer(data.uuid);
            if (uuidByteBuffer.byteLength != 16) {
                throw new RangeError('Given UUID length (' + uuidByteBuffer.byteLength + ') does not equals 32 Bytes!');
            }

            for(let index = 0; index < uuidByteBuffer.byteLength; index++) {
                dataBytes[currentByteIndex + index] = uuidByteBuffer[index];
            }            
            currentByteIndex += uuidByteBuffer.byteLength;
        }

        /* Encode flights */
        for (let flightLeg = 0; flightLeg < data.flights.length; flightLeg++) {

            let flight = data.flights[flightLeg];
            if (flight.designator.length < 2 || flight.designator.length > 3)
                throw new RangeError('Flight Designator ' + flight.designator + ' has unsupported length!');
            if (flight.flightNumber < 0 || flight.flightNumber > 9999)
                throw new RangeError('Flight Number ' + flight.flightNumber + ' is not in allowed range! (0-9999)');

            const designatorFirstChar = flight.designator.substring(0, 1);
            const designatorSecondChar = flight.designator.substring(1, 2);
            const designatorThirdChar = (flight.designator.length == 3) ? flight.designator.substring(2, 3) : " ";

            const designatorFirstCharEncoded = this.codesetAlpha(designatorFirstChar);
            const designatorSecondCharEncoded = this.codesetAlpha(designatorSecondChar);
            const designatorThirdCharEncoded = this.codesetAlphaNumeric(designatorThirdChar);
            const flightNumberEncoded = flight.flightNumber & 0x3FFF;

            const date = new Date(flight.dateOfFlight);

            const yearEncoded = date.getFullYear() & 0x3FFF;
            const monthEncoded = date.getMonth() & 0xF;
            const dayEncoded = (date.getDay() - 1) & 0x1F;

            const departureAirport1Encoded = this.codesetAlpha(flight.departureAirport.substring(0, 1));
            const departureAirport2Encoded = this.codesetAlpha(flight.departureAirport.substring(1, 2));
            const departureAirport3Encoded = this.codesetAlpha(flight.departureAirport.substring(2, 3));

            const arrivalAirport1Encoded = this.codesetAlpha(flight.arrivalAirport.substring(0, 1));
            const arrivalAirport2Encoded = this.codesetAlpha(flight.arrivalAirport.substring(1, 2));
            const arrivalAirport3Encoded = this.codesetAlpha(flight.arrivalAirport.substring(2, 3));

            dataBytes[currentByteIndex + 0] = ((designatorFirstCharEncoded << 3) & 0xF8) | ((designatorSecondCharEncoded >> 2) & 0x7);
            dataBytes[currentByteIndex + 1] = ((designatorSecondCharEncoded << 6) & 0xC0) | ((designatorThirdCharEncoded << 0) & 0x3F);
            dataBytes[currentByteIndex + 2] = (flightNumberEncoded >> 6) & 0xFF;
            dataBytes[currentByteIndex + 3] = ((flightNumberEncoded << 2) & 0xFC) | ((yearEncoded >> 12) & 0x3);
            dataBytes[currentByteIndex + 4] = ((yearEncoded >> 4) & 0xFF);
            dataBytes[currentByteIndex + 5] = ((yearEncoded << 4) & 0xF0) | ((monthEncoded << 0) & 0x0F);
            dataBytes[currentByteIndex + 6] = ((dayEncoded << 3) & 0xF8) | ((departureAirport1Encoded >> 2) & 0x07);
            dataBytes[currentByteIndex + 7] = ((departureAirport1Encoded << 6) & 0xC0) | ((departureAirport2Encoded << 1) & 0x01) | ((departureAirport3Encoded << 0) & 0x1);
            dataBytes[currentByteIndex + 8] = ((departureAirport3Encoded << 4) & 0xF0) | ((arrivalAirport1Encoded >> 1) & 0xF);
            dataBytes[currentByteIndex + 9] = ((arrivalAirport1Encoded << 7) & 0x80) | (arrivalAirport2Encoded << 2) & 0x7C | (arrivalAirport3Encoded >> 3) & 0x03;
            dataBytes[currentByteIndex + 10] = ((arrivalAirport3Encoded << 5) & 0xE0); /* 5 Bit Reserve */
        }

        return dataBytes;
    }

    public encodeQrCode(data : Uint8Array) : string {
        return base45.encode(data);
    }

    public decode(data: string): BagTagModel {
        /* First Step, decode Base45 */
        let base45DecodedData = base45.decode(data);


        return <BagTagModel>{};
    }

    private uuidToBuffer(guid: string): Uint8Array {        
        const buffer = uuidParse(guid);
        return buffer;
    }


    private codesetNumeric(char: string): number {
        switch (char) {
            case '0': return 0;
            case '1': return 1;
            case '2': return 2;
            case '3': return 3;
            case '4': return 4;
            case '5': return 5;
            case '6': return 6;
            case '7': return 7;
            case '8': return 8;
            case '9': return 9;
            default:
                throw new RangeError(char + ' is not a supported character in Numeric Codeset (0-9)')
        }
    }

    private codesetAlpha(char: string): number {
        switch (char) {
            case ' ': return 0;
            case 'A': return 1;
            case 'B': return 2;
            case 'C': return 3;
            case 'D': return 4;
            case 'E': return 5;
            case 'F': return 6;
            case 'G': return 7;
            case 'H': return 8;
            case 'I': return 9;
            case 'J': return 10;
            case 'K': return 11;
            case 'L': return 12;
            case 'M': return 13;
            case 'N': return 14;
            case 'O': return 15;
            case 'P': return 16;
            case 'Q': return 17;
            case 'R': return 18;
            case 'S': return 19;
            case 'T': return 20;
            case 'U': return 21;
            case 'V': return 22;
            case 'W': return 23;
            case 'X': return 24;
            case 'Y': return 25;
            case 'Z': return 26;
            default:
                throw new RangeError(char + ' is not a supported character in Alpha Codeset (A-Z)')
        }
    }

    private codesetAlphaNumeric(char: string): number {
        switch (char) {
            case ' ': return 0;
            case 'A': return 1;
            case 'B': return 2;
            case 'C': return 3;
            case 'D': return 4;
            case 'E': return 5;
            case 'F': return 6;
            case 'G': return 7;
            case 'H': return 8;
            case 'I': return 9;
            case 'J': return 10;
            case 'K': return 11;
            case 'L': return 12;
            case 'M': return 13;
            case 'N': return 14;
            case 'O': return 15;
            case 'P': return 16;
            case 'Q': return 17;
            case 'R': return 18;
            case 'S': return 19;
            case 'T': return 20;
            case 'U': return 21;
            case 'V': return 22;
            case 'W': return 23;
            case 'X': return 24;
            case 'Y': return 25;
            case 'Z': return 26;
            case '0': return 27;
            case '1': return 28;
            case '2': return 29;
            case '3': return 30;
            case '4': return 31;
            case '5': return 32;
            case '6': return 33;
            case '7': return 34;
            case '8': return 35;
            case '9': return 36;
            default:
                throw new RangeError(char + ' is not a supported character in Alpha Numeric Codeset (A-Z, 0-9)')
        }
    }
}