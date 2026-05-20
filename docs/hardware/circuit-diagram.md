# Vehicle Box Circuit Diagram

This is a production-oriented reference circuit, not a final PCB. A final board needs electrical validation, EMC testing, thermal review, automotive compliance review, and vehicle-specific installation approval.

## Hardware Block Diagram

```mermaid
flowchart TB
    Battery["Vehicle 12 V / 24 V Battery"]
    Fuse["Inline Fuse"]
    Protection["Reverse Polarity + TVS + Load Dump Protection"]
    Buck["Automotive Buck 5 V"]
    LDO["3.3 V LDO / Buck"]
    Backup["Backup Battery + Charger"]

    MCU["ESP32-S3 MCU Module"]
    Secure["Secure Element"]
    LTE["LTE/NB-IoT Modem"]
    GNSS["GNSS Module"]
    CAN["CAN FD Transceiver"]
    OBD["OBD-II Connector"]
    IMU["6-Axis IMU"]
    Photo["Photodiode + TIA"]
    NFC["NFC Reader"]
    RelayDrv["Protected Relay / High-Side Driver"]
    Lock["Door/Seat/Immobilizer Safe Actuator"]
    Tamper["Tamper Switches"]
    Status["RGB Status LED + Buzzer"]

    Battery --> Fuse --> Protection --> Buck --> LDO --> MCU
    Protection --> Backup --> LDO
    MCU <--> Secure
    MCU <--> LTE
    MCU <--> GNSS
    MCU <--> CAN
    CAN <--> OBD
    MCU <--> IMU
    Photo --> MCU
    NFC <--> MCU
    MCU --> RelayDrv --> Lock
    Tamper --> MCU
    MCU --> Status
```

## Reference Wiring Table

| Signal | From | To | Interface | Notes |
| --- | --- | --- | --- | --- |
| VIN | Vehicle battery | Fuse/protection | Power | Fuse close to tap point. |
| 5V_SYS | Buck regulator | LTE modem, relay logic if needed | Power | Size for modem peak current. |
| 3V3_SYS | LDO/buck | MCU, secure element, IMU, GNSS IO | Power | Low-noise rail for sensors. |
| I2C_SDA/SCL | ESP32-S3 | Secure element, IMU | I2C | Pullups to 3.3 V. |
| UART_LTE_TX/RX | ESP32-S3 | LTE modem | UART | Add level shifting if modem IO differs. |
| UART_GNSS_TX/RX | ESP32-S3 | GNSS module | UART | GNSS PPS optional GPIO input. |
| SPI_CAN_MOSI/MISO/SCK/CS | ESP32-S3 | CAN controller if external | SPI | If MCU CAN controller is unavailable, use external controller. |
| CAN_TX/RX | MCU/CAN controller | MCP2562FD | Digital | VIO tied to MCU IO voltage. |
| CANH/CANL | MCP2562FD | OBD-II connector | CAN bus | Add ESD protection and optional termination based on topology. |
| PHOTO_ADC | TIA output | ESP32-S3 ADC/comparator | Analog/digital | Shield from sunlight and filter ambient light. |
| NFC_IRQ/SPI | NFC reader | ESP32-S3 | SPI/I2C | Optional for card unlock. |
| LOCK_CTRL | ESP32-S3 | Relay/high-side driver | GPIO | Use fail-safe state and flyback protection. |
| TAMPER_IN | Tamper switches | ESP32-S3 | GPIO | Use pullups and debounce. |
| VBAT_SENSE | Divider | ESP32-S3 ADC | Analog | Use high-value divider and protection. |

## Optical Receiver Circuit

```mermaid
flowchart LR
    Light["Phone flashlight pulses"]
    PD["BPW34-style photodiode"]
    TIA["Transimpedance amplifier"]
    Filter["Band-pass / ambient rejection"]
    Comparator["Comparator or ADC threshold"]
    MCU["ESP32-S3 decoder"]

    Light --> PD --> TIA --> Filter --> Comparator --> MCU
```

Recommended optical receiver design:

- Use a photodiode behind a smoked or narrow optical window.
- Place the receiver where the user can aim the phone flashlight directly.
- Add analog filtering for ambient light rejection.
- Use digital preamble detection before accepting payload bits.
- Keep unlock timing tolerant of different phone flashlight response times.

## Power Input Circuit

```mermaid
flowchart LR
    VIN["Vehicle VIN"]
    Fuse["Fuse"]
    Reverse["Reverse polarity protection"]
    TVS["Automotive TVS diode"]
    EMI["EMI filter"]
    Buck["Automotive buck regulator"]
    Rails["5 V and 3.3 V rails"]

    VIN --> Fuse --> Reverse --> TVS --> EMI --> Buck --> Rails
```

Power requirements:

- Automotive transient protection.
- Load dump rated parts.
- Reverse battery protection.
- Brownout detection.
- Backup battery switchover.
- Separate high-current load path for actuators.

## Lock Output Circuit

```mermaid
flowchart LR
    MCU["MCU GPIO"]
    Gate["Driver / opto-isolated input"]
    Switch["Protected high-side or relay driver"]
    Actuator["Approved lock actuator"]
    Feedback["Position / current feedback"]

    MCU --> Gate --> Switch --> Actuator
    Switch --> Feedback --> MCU
```

Production safety rules:

- Default state must be safe if MCU resets.
- Use current sensing to detect stuck actuator or cut wire.
- Never directly switch critical vehicle safety circuits.
- Immobilizer control must require stationary/ignition-safe validation.

## PCB Layout Notes

- Keep LTE antenna region clear of copper and noisy switching regulators.
- Separate analog photodiode trace from LTE, buck, and relay paths.
- Use star grounding or carefully partitioned ground returns.
- Protect OBD/CAN lines with automotive ESD devices.
- Keep secure element near MCU on short I2C traces.
- Add programming pads for factory only; lock or depopulate debug access for field units.
