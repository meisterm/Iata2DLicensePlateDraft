# IATA Draft for 2D Barcoded Bag Tag

A typescript reference implementation with a basic user frontend can be found on [Github Project Pages](https://meisterm.github.io/Iata2DLicensePlateDraft/)

## Short Description

To this day, the Interleaved 2 of 5 barcode, which encodes the License Plate Number, is the standard for baggage identification in the airline transportation industry. This tried and tested technology has various disadvantages, which are to be eliminated by the introduction of a new barcode. This is described in this draft, which could be introduced in future as an IATA Recommended Practice.

## Considerations

Baggage is currently identified using a 10-digit License Plate Number. This number is printed on the baggage tag in the form of an Interleaved 2 of 5 barcode. All subsequent baggage handling systems read and process this in order to bring the baggage to the desired destination.

### Disadvantages of current solution

* The current standard uses Interleaved 2 of 5 barcodes without a check digit, which leads to misreadings in baggage sorting systems.
* The License Plate Number contains an identification for the airline with 3 characters, therefore a maximum of 10,000,000, in practice only 1,000,000 IDs are available per airline. This leads to frequent overflow.
* In order to obtain information on the routing of the baggage, the parallel transmission of baggage information is always necessary. In the event of a system failure, correct baggage transportation is generally no longer possible.

### Requirements for a new code

* Broad reading support from the readers available on the market
* Broad printing support from the bag tag printers available on the market
* Use of an open standard, also to avoid license costs
* The ability to read even partially damaged barcodes
* The ability to use a unique identifier without the risk of number overflow
* Backwards compatibility with the current standard to ensure parallel use during the transition period
* The new code must be supplemented with additional data in order to be able to implement a fallback level in the event of a system failure
* The passenger name should not be part of the code to avoid problems with data protection laws

### Dependencies during the introduction of the new code

* Existing label printers and self-service kiosks must be equipped to print the new 2D code on the bag tags
* In Parallel: Baggage systems such as DCS, BHS, BRS, etc. must be upgraded to be able to handle the new globally unique identifier instead of a 10-digit baggage ID and the additional data to benefit from the new features
* Scanner gates, hand scanners, readers and cameras must be equipped to read 2D barcodes

# Specifications

## General specifications

* The used 2D Barcode is the widely known and used "quick-response code" (QR Code) as defined in [ISO/IEC 18004 in the latest version of 2024](https://www.iso.org/standard/83389.html) This code is free to use without any license issues.
* A new global unique identifier is introduced to replace the license plate number in future. A UUID as defined in [RFC 4122](https://datatracker.ietf.org/doc/html/rfc4122) is used. The usage of UUID to identify a bag is also recommended by RP 1755. ([See discussion](#discussions))
* The QR code is printed on both "sides" of a bag tag. It should be placed on the bag tag in combination with the previous IL2of5 barcode to maintain downward compatibility

### Transition time

There will be a longer transition time while the old and the new code is still required. This is taken into account by the specifications in this standard.

## Data definition

### Packetview

#### Header

```mermaid
packet-beta
title 2D Bag Tag Code (Header)
0-2: "Version"
3: "P1"
4: "P2"
5-7: "Flight Legs"
8-24: "License Plate Number"
25-152: "UUID"
```
#### Flight Leg

```mermaid
packet-beta
title 2D Bag Tag Code (Flight Leg)
0-4: "Designator 1"
5-9: "Designator 2"
10-14: "Designator 3"
15-29: "Flight Number"
30-43: "Year of Flight"
44-47: "Month of Flight"
48-52: "Day of Flight"
53-57: "Departure Airport 1"
58-62: "Departure Airport 2"
63-67: "Departure Airport 3"
68-72: "Arrival Airport 1"
73-77: "Arrival Airport 2"
78-82: "Arrival Airport 3"
83-87: "Reserve"
```

### Description Table

#### Header

| Fieldname | M/C/O | Bit length | Codeset | (Example) Value | Description |
| --------- | ----- | ---------- | ----- | -- | ----------- |
| Version   | M     | 3    | Numeric (0-7)      | 0x0  | The Version of the Code-Specification which is currently 0 |
| LPN Number presence (P1) | M | 1 | Boolean | 0x1 | Set to 1 if LPN Number is present, should be mandatory in version 1 for downward capability  |
| UUID presence (P2) | M | 1 | Boolean | 0x1 | Set to 1 if UUID is present, otherwise 0 |
| Number of Flight Legs | M | 3 | Numeric + 1 (1-8) | 1 | The number of flight legs encoded after the Header. The minimum number of flight Legs is 1 (0x0) the maximum is 8 (0x7)  |
| LPN Number | C | 40 | 10x Numeric Characters | 0220123456 | The License Plate Number encoded in 10 Half-Bytes, only present if "LPN Number presence" is set to 1 |
| UUID | C | 128 | UUID | 676a1ff6-3750-4399-b427-a1d74e07f6c9 | The UUID as defined in [General specifications](#General specifications), only present if "UUID presence" is set to 1 |

#### Flight Leg

| Fieldname | M/C/O | Bit length | Codeset | (Example) Value | Description |
| --------- | ----- | ---------- | ----- | -- | ----------- |
| Designator | M | 10 | 2x [Alpha-Characters](#alpha-characters-5-bits) | "LH" | First two Alpha-Characters of Designator |
| Designator | M | 6 | 1x [Alpha-Numeric-Character](#alpha-numeric-characters-6-bits) | "LH" | Third Alpha-Numeric-Character of Designator |
| Flight Number | M | 14 | Numeric (0-16383) | 500 | Flightnumber (0-9999) |
| Year of flight | M | 14 | Numeric (0-16383) | 2025 | Year of Flight |
| Month of flight | M | 4 | Numeric (0-15) | 7 | Month of Flight |
| Day of flight | M | 5 | Numeric + 1 (0-30) | 2025 | Day of Flight (1-31) |
| Departure Airport | M | 15 | 3x [Alpha-Characters](#alpha-characters-5-bits) | "FRA" | IATA 3-Letter Code of Departure Airport |
| Arrival Airport | M | 15 | 3x [Alpha-Characters](#alpha-characters-5-bits) | "MUC" | IATA 3-Letter Code of Departure Airport |

### JSON representation

The above description is the format definition for the encoded data in the QR code. It's also possible to represent the data in JSON format as shown below.

```js
{
    "version": 1,
    "lpn": "0220123456",
    "uuid": "676a1ff6-3750-4399-b427-a1d74e07f6c9",
    "flights": [
        {
            "designator": "LH",
            "flightNumber": 500,
            "dateOfFlight": "2025-04-01",
            "departureAirport": "FRA",
            "arrivalAirport": "MUC"
        },
        {
            "designator": "LH",
            "flightNumber": 600,
            "dateOfFlight": "2025-04-02",
            "departureAirport": "MUC",
            "arrivalAirport": "PMI"
        }
    ]
}
```


## Encoding

### Binary representation 

The above JSON example is encoded in binary format following the data definition as following

```
39 02 20 12   34 56 67 6A   
1F F6 37 50   43 99 B4 27   
A1 D7 4E 07   F6 C9 62 00   
07 D0 7E 93   09 81 16 D4   
60 62 00 09   60 7E 93 13   
41 38 35 20   
```

### QR Code String representation

In order to accommodate as much data as possible in the QR code, the binary format defined above is kept very compact. QR codes support a 45-character subset of the US-ASCII standard. We therefore use the [Base45 encoding as described in RFC9285](https://datatracker.ietf.org/doc/html/rfc9285) to store the binary data for the QR code. 

The encoded Data is represented as Text and is prefixed with `IATALP` to make it easy for scanners and readers to detect a 2D License Plate QR Code without the need to decode the binary data.

The above binary data example is encoded as following:

```
IATALPE97K24XR6E3D$14U:6PO8*YMVKK+%9.8VNHCK:030G391**2E8C900.8CVQI1B8AW6
```

### QR Code Image Generation

The capacity and size of the qr code depends on its version and ECC level.

A suitable size for the Bag Tag is between 30 and 40 modules. Therefore, versions 4 and 5, possibly also 6, are possible.

|Version | Modules | ECC level | Data bits |
| - | ----- | - | --- |
| 4 | 33x33 | L | 440 |
| 4 | 33x33 | M | 352 |
| 4 | 33x33 | Q | 272 |
| 4 | 33x33 | H | 208 |
| 5 | 37x37 | L | 864 |
| 5 | 37x37 | M | 688 |
| 5 | 37x37 | Q | 496 |
| 5 | 37x37 | H | 368 |
| 6 | 41x41 | L | 1088 |
| 6 | 41x41 | M | 864 |
| 6 | 41x41 | Q | 608 |
| 6 | 41x41 | H | 480 |

There is an error correction level available for QR codes which allowes parts to be covered or damaged. To ensure that the QR code can always be read reliably, we do not recommend using an ECC level lower than M. A specification for the ECC level cannot yet be made. ([see discussion](#ECC-level)) 

A specification for the QR Code Version cannot yet be made. ([see discussion](#QR-Code-Version)) 

#### Example QR Code

![Example QR Code Image for 2D barcoded Bag Tag](demo_qr.png)

# Discussions

## Global Unique Identifier

It must be decided how a UUID is to be structured. It is recommended to use the UUID v4 (randomly generated UUIDs) where the first two bytes represent a prefix of the issuing airline. With 2 bytes, 65536 airlines or issuers or namespaces can be defined. The remaining 14 bytes can then be used by the airline to code its baggage. This at least guarantees that there are no collisions between the airlines. The issuer/airline is responsible for ensuring that there are no collisions within the namespace.

## ECC level

The ECC level should be the highest possible. But tests must show which ECC level delivers good read results in practice and still guarantees a high data volume.

## QR Code Version

The final QR Code Version for the specification have to be shown by tests.

The minimum required Bit Size to encode 3 Legs without any custom data is 417 bit plus the header size of 33 Bits = 450 Bits (56 Bytes). This could be covered by Version 5 with ECC Level Q. For let some space for more Data Version 6 with ECC Level Q would be an alternative with 608 bits.
The maximum Bit Size of a 2D Bag Tag Code would be 857 bits + 33 bits header = 890 bits to encode 8 flight legs.

## General encoding discussion

The coding is optimized for a minimum size. Therefore the bytes are not aligned. However, this makes encoding and decoding significantly more complex than if a simpler method were used. Despite this, it is possible to implement the coding in all common programming languages.

Alternatively, one could consider a simpler encoding, but then one would have to accept a higher QR code level with a correspondingly less readable QR code.

The development of open source libraries for free use should be considered.

## Bit Encoding - Possible optimization

* Full Year of flight is encoded in 14 bit. When using an offset like year 2000 and to cover the next 255 years with this specification, we could reduce the number of bits for the year to 8.

# Appendix

## Codesets


#### Alpha-Numeric-Characters (6 Bits)

| Numeric Value | Representation |
| ------------- | -------------- |
| 0 | None / Space |
| 1 | A |
| 2 | B |
| 3 | C |
| 4 | D |
| 5 | E |
| 6 | F |
| 7 | G |
| 8 | H |
| 9 | I |
| 10 | J |
| 11 | K |
| 12 | L |
| 13 | M |
| 14 | N |
| 15 | O |
| 16 | P |
| 17 | Q |
| 18 | R |
| 19 | S |
| 20 | T |
| 21 | U |
| 22 | V |
| 23 | W |
| 24 | X |
| 25 | Y |
| 26 | Z |
| 27 | 0 |
| 28 | 1 |
| 29 | 2 |
| 30 | 3 |
| 31 | 4 |
| 32 | 5 |
| 33 | 6 |
| 34 | 7 |
| 35 | 8 |
| 36 | 9 |
| 37-63 | Reserved |

#### Alpha-Characters (5 Bits)

| Numeric Value | Representation |
| ------------- | -------------- |
| 0 | None / Space |
| 1 | A |
| 2 | B |
| 3 | C |
| 4 | D |
| 5 | E |
| 6 | F |
| 7 | G |
| 8 | H |
| 9 | I |
| 10 | J |
| 11 | K |
| 12 | L |
| 13 | M |
| 14 | N |
| 15 | O |
| 16 | P |
| 17 | Q |
| 18 | R |
| 19 | S |
| 20 | T |
| 21 | U |
| 22 | V |
| 23 | W |
| 24 | X |
| 25 | Y |
| 26 | Z |
| 27-31 | Reserved |

# License

This specification draft was created by Holger Martiker (Fraport AG) and was published for public review and discussion. 
