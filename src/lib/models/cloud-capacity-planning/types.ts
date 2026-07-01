export interface ServiceClass {
  serviceClass: number;
  incomingLoad_a: number;
  bu: number;
}
export interface KeyedValues {
  [key: string]: number;
}

export interface Capacities {
  ramCapacity: KeyedValues;
  processorCapacity: KeyedValues;
  diskCapacity: KeyedValues;
  bpsCapacity: KeyedValues;
}

export interface ServiceClassConfigs {
  ram: ServiceClass[];
  processor: ServiceClass[];
  disk: ServiceClass[];
  bitrate: ServiceClass[];
}

export interface BlockingRatios {
  RAM: KeyedValues;
  Processor: KeyedValues;
  Disk: KeyedValues;
  Bps: KeyedValues;
}
