import { EventEmitter } from 'events';

class TelemetryEmitter extends EventEmitter {}

declare global {
  var telemetryEmitter: TelemetryEmitter | undefined;
}

export const telemetryEmitter = global.telemetryEmitter || new TelemetryEmitter();

if (process.env.NODE_ENV !== 'production') {
  global.telemetryEmitter = telemetryEmitter;
}
