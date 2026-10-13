import type {
  EmlmReplicationSummary,
  EmlmServiceClassParams,
  EmlmSimulationResult,
} from "@/lib/models/simulation/emlm-simulation";
import type {
  ServiceDistribution,
  ServiceDistributionParams,
} from "@/lib/models/simulation/service-time-distributions";

export interface EmlmOutput {
  summary: EmlmReplicationSummary;
  runs: EmlmSimulationResult[];
  seeds: number[];
  capacity: number;
  callsPerSeed: number;
  serviceDist: ServiceDistribution;
  serviceDistParams: ServiceDistributionParams;
  classes: EmlmServiceClassParams[];
  analyticalQ: number[];
  analyticalBlocking: number[];
  elapsedMs: number;
}
