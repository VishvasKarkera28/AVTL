# Component Selection Notes

This file records current component direction for engineering review. Treat it as a selection guide, not a purchase order.

## MCU

Recommended class: ESP32-S3 module for the first vehicle-box prototype.

Why:

- BLE support for nearby unlock.
- Enough GPIO and peripherals for optical receiver, modem, GNSS, IMU, status outputs, and lock driver.
- Security features such as secure boot and flash encryption.

Reference:

- Espressif ESP32-S3 documentation: https://www.espressif.com/en/products/socs/esp32s3/docs

## Secure Element

Production direction:

- Microchip TA100/TA101 CryptoAutomotive security ICs for automotive-oriented secure boot, TLS, CAN authentication, key storage, OTA verification, and user access privilege.
- NXP SE050 for IoT secure element workflows where Plug and Trust tooling and broad crypto support matter.

Prototype-only direction:

- ATECC608B-class secure element can be used for learning and early tests, but Microchip currently marks ATECC608B as not recommended for new designs. Do not lock production hardware around it without a part-selection review.

References:

- Microchip CryptoAutomotive security ICs: https://www.microchip.com/en-us/products/security/security-ics/cryptoautomotive-security-ics
- NXP SE050: https://www.nxp.com/products/SE050
- Microchip ATECC608B status page: https://www.microchip.com/en-us/product/atecc608b

## Cellular Modem

Recommended class: LTE Cat M1/NB-IoT module with GNSS option and carrier certification for target markets.

Candidate family:

- Quectel BG95 class module.

Reference:

- Quectel BG95 series: https://developer.quectel.com/en/modules-cat/bg95-series

## GNSS

Recommended class: active, currently available GNSS module with UART or I2C, external antenna support, and operating temperature suitable for vehicle interiors.

Candidate family:

- u-blox M10/M11-class GNSS modules.

Reference:

- u-blox GNSS modules: https://www.u-blox.com/en/product/max-m10-series

## CAN/OBD

Recommended class: automotive CAN FD transceiver with standby mode and IO voltage support.

Candidate family:

- Microchip MCP2562FD class transceiver.

Reference:

- Microchip MCP2562FD: https://www.microchip.com/en-us/product/mcp2562fd

## Optical Receiver

Recommended class:

- Silicon photodiode plus transimpedance amplifier.
- Ambient-light filtering before MCU decode.

Candidate amplifier:

- TI OPA381 class transimpedance amplifier.

Reference:

- TI OPA381: https://www.ti.com/product/OPA381

## Protected Outputs

Recommended class:

- Automotive protected high-side switch or certified relay driver with current sense for horn, light, and approved lock actuation paths.

Reference:

- STMicroelectronics automotive high-side switches: https://www.st.com/en/automotive-analog-and-power/high-side-switches/products.html
