import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BagTagEncoder } from '../QrBagTag/BagTagEncoder';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'webEncoder';

  public jsonObjectString: string = '';
  public qrString : string = '';

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

    this.jsonObjectString = JSON.stringify(demo);
  }

  public encodeObject() {
    try {
    const obj = JSON.parse(this.jsonObjectString);

    const bytes = this.encoder.encodeInBytes(obj);
    console.log(bytes);
    const myQrString = this.encoder.encodeQrCode(bytes);
    console.log(myQrString);
    this.qrString = myQrString;
    
    } catch(ex : any) {
      console.error(ex);
      alert(ex);
    }
  }
}
