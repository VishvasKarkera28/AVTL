# Vehicle Box Firmware

Target stack: ESP-IDF for ESP32-S3-class MCU.

## Firmware Modules

- Secure boot and flash encryption.
- Secure element integration.
- LTE/MQTT or HTTPS transport.
- GNSS location service.
- BLE unlock service.
- Optical unlock decoder.
- OBD-II/CAN polling.
- IMU event detection.
- Lock output controller.
- Tamper detection.
- OTA update manager.
- Offline event queue.

## Safety Rules

- Lock output defaults to safe state on reset.
- Immobilization requires stationary or ignition-safe validation.
- Debug interfaces are disabled or locked for production.
- Device never executes expired or unsigned commands.
- Local replay cache blocks repeated offline unlock tokens.
