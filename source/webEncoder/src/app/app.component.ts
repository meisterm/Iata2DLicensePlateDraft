import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BagTagEncoder } from '../QrBagTag/BagTagEncoder';
import { QrCodeComponent, QrCodeModule } from 'ng-qrcode';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    QrCodeModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'webEncoder';

  public jsonObjectString: string = '';
  public qrString: string = '';
  public hexString: string = '';

  private encoder = new BagTagEncoder();

  constructor() {

    const demo = {
      version: 1,
      lpn: "0220123456",
      uuid: "676a1ff6-3750-4399-b427-a1d74e07f6c9",
      flights: [
        {
          designator: "LH",
          flightNumber: 500,
          dateOfFlight: "2025-04-01",
          departureAirport: "FRA",
          arrivalAirport: "MUC"
        },
        {
          designator: "LH",
          flightNumber: 600,
          dateOfFlight: "2025-04-02",
          departureAirport: "MUC",
          arrivalAirport: "PMI"
        }
      ]
    };

    this.jsonObjectString = JSON.stringify(demo, null, 2);
  }

  public decodeQrCode() {

  }

  public encodeObject() {
    try {
      const obj = JSON.parse(this.jsonObjectString);
      const bytes = this.encoder.encodeInBytes(obj);
      const key = '0123456789ABCDEF';

      let newHex: string = '';

      for (let i=0; i<bytes.length; i++) { // Go over each 8-bit byte
        let currentChar = (bytes[i] >> 4)      // First 4-bits for first hex char
        newHex += key[currentChar]         // Add first hex char to string
        currentChar = (bytes[i] & 15)      // Erase first 4-bits, get last 4-bits for second hex char
        newHex += key[currentChar]         // Add second hex char to string
        newHex += ' ';
        if(i > 0 && ((i+1) % 4) == 0) newHex += '  ';
        if(i > 0 && ((i+1) % 8) == 0) newHex += '\r\n';
      }

      this.hexString = newHex;

      const myQrString = this.encoder.encodeQrCode(bytes);

      this.qrString = myQrString;

    } catch (ex: any) {
      console.error(ex);
      alert(ex);
    }
  }
}
