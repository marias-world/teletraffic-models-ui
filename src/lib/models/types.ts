export interface ServiceClass {
  serviceClass: number;
  bu: number;
  incomingLoad_a: number;
}

export interface ServiceClassWithBR extends ServiceClass {
  tk: number; // reserved bandwidth
}

export interface RequestedBandwidthFromLink {
  link: number;
  bu: number;
}

export interface ServiceClassWithRoute {
  serviceClass: number;
  incomingLoad_a: number;
  route: RequestedBandwidthFromLink[];
  tk?: number;
}

export interface networkTopology {
  [link: string]: number;
}
