# FlashFleet Vehicle Box Hardware Specification

## Purpose

The vehicle box is the secure edge device installed in each vehicle. It handles telemetry, access control, offline unlock, lock actuation, tamper detection, and device health reporting.

## Required Subsystems

| Subsystem | Function |
| --- | --- |
| MCU | Main firmware, crypto orchestration, BLE, local policy checks. |
| Secure Element | Hardware-backed private keys, signing, token validation support. |
| GNSS | Vehicle location and time source. |
| LTE/NB-IoT | Cloud connectivity. |
| BLE | Nearby app unlock and provisioning. |
| OBD-II/CAN | Vehicle health and diagnostic telemetry. |
| IMU | Harsh braking, acceleration, crash, vibration, tamper detection. |
| Optical Receiver | Phone flashlight unlock signal receiver. |
| Lock Driver | Controls approved lock relay or vehicle-specific actuator. |
| Backup Battery | Short-term operation during power cut or tamper event. |
| Tamper Inputs | Enclosure open, power cut, antenna disconnect, relay tamper. |
| Power Protection | Automotive transient protection, fusing, reverse polarity protection. |

## Candidate Component Classes

| Component | Candidate | Notes |
| --- | --- | --- |
| MCU | ESP32-S3 module | BLE, secure boot, flash encryption, strong ecosystem. |
| Secure Element | Microchip TA100/TA101, NXP SE050, or equivalent | Hardware root of trust for device identity and signing. ATECC608B-class parts are acceptable for prototype only. |
| GNSS | u-blox M10/M11-class or equivalent active GNSS module | Dedicated GNSS module for location and time. Select an active, available part before PCB freeze. |
| Cellular | Quectel BG95 series or equivalent | LTE Cat M1/NB-IoT class modem. |
| CAN Transceiver | Microchip MCP2562FD or equivalent | Automotive CAN FD transceiver with VIO support. |
| IMU | Automotive-qualified IMU preferred | Use BMI270 only for prototype; select automotive grade for production. |
| Photodiode Amplifier | BPW34-style photodiode plus transimpedance amplifier | Optical unlock receiver. |
| High-Side Driver | Automotive protected high-side switch | Horn, lights, auxiliary load control where legal. |
| Relay/Actuator | Automotive relay or solid-state switch | Lock actuator only through safe certified integration. |

## Production Hardware Requirements

- Automotive input range support, typically 9 V to 36 V depending on target vehicles.
- Load dump, reverse polarity, ESD, and surge protection.
- Dedicated fuse close to vehicle battery tap.
- Brownout-safe flash writes.
- Hardware watchdog.
- Secure boot locked before field deployment.
- Debug ports disabled or physically protected after provisioning.
- Enclosure tamper switch.
- Internal backup battery with charge protection.
- Device serial and public key printed as QR code inside enclosure.

## Installation Safety

For production vehicles, install only with certified technicians. Never cut critical braking, steering, airbag, ABS, or engine safety wiring. Immobilization should be vehicle-approved and should only engage under safe state rules.

## Hardware References

- Espressif ESP32-S3 security documentation and datasheet.
- Microchip CryptoAutomotive TA100/TA101 secure IC documentation.
- NXP SE050 secure element documentation.
- u-blox GNSS module documentation.
- Quectel BG95 LPWA module documentation.
- Microchip MCP2562FD CAN FD transceiver documentation.
- TI OPA381 transimpedance amplifier documentation.
- STMicroelectronics automotive high-side switch product family documentation.
