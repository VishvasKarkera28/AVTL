# Hardware Bill of Materials

This BOM is a candidate production direction. Final part selection must consider local availability, automotive qualification, certifications, temperature range, antenna design, carrier approval, and cost.

## Core BOM

| Category | Candidate Part/Class | Quantity | Purpose |
| --- | --- | ---: | --- |
| MCU | ESP32-S3 module | 1 | Main control, BLE, local policy, optical decoding. |
| Secure element | Microchip TA100/TA101, NXP SE050, or equivalent | 1 | Device identity, key storage, signing support. Use ATECC608B only for prototype learning. |
| Cellular modem | Quectel BG95 class LTE Cat M1/NB-IoT module | 1 | Cloud connectivity. |
| GNSS | Active u-blox M10/M11-class or equivalent GNSS module | 1 | Location and secure time source. |
| CAN transceiver | MCP2562FD class CAN FD transceiver | 1 | OBD-II/CAN connection. |
| IMU | Automotive-qualified 6-axis IMU | 1 | Driving behavior, vibration, crash, tamper signals. |
| Photodiode | BPW34-style photodiode | 1 | Optical unlock receiver. |
| TIA op-amp | OPA381 class transimpedance amplifier | 1 | Photodiode signal conditioning. |
| NFC reader | PN532/ST25R class reader | Optional | NFC card unlock. |
| High-side switch | Automotive protected high-side switch | 1-4 channels | Horn, light, lock actuator support where approved. |
| Relay/solid-state output | Automotive rated | As needed | Lock actuator or approved immobilizer interface. |
| Buck regulator | Automotive buck 12/24 V to 5 V | 1 | Main power conversion. |
| LDO/buck | 5 V to 3.3 V | 1 | Logic power rail. |
| Backup battery | Li-ion/LiFePO4 pack with charger/protection | 1 | Tamper and offline operation. |
| TVS and ESD | Automotive protection parts | As needed | Vehicle power and signal protection. |
| Enclosure | IP-rated tamper enclosure | 1 | Physical protection. |
| Antennas | LTE, GNSS, optional BLE external | As needed | Reliable RF operation. |

## Prototype Versus Production

| Area | Prototype | Production |
| --- | --- | --- |
| MCU board | ESP32-S3 dev board | Certified module on custom PCB. |
| Power | Lab buck board | Automotive load-dump protected power stage. |
| Cellular | Dev kit modem | Carrier-approved modem design. |
| Lock output | Bench relay | Certified automotive driver and harness. |
| Enclosure | 3D print | IP-rated, tamper-aware enclosure. |
| Security | Test keys | Factory-provisioned secure element and locked firmware. |

## Sourcing Notes

- Prefer automotive grade temperature range for in-vehicle electronics.
- Confirm LTE bands and carrier certification for target countries.
- Confirm GNSS antenna placement before PCB freeze.
- Do not finalize the relay/immobilizer path until the target vehicle wiring and legal rules are known.
