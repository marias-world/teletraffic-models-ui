import { runEmlmSimulation, EmlmSimulationParams } from "./emlm-simulation";

self.onmessage = (event: MessageEvent<EmlmSimulationParams>) => {
  const result = runEmlmSimulation(event.data);
  self.postMessage(result);
};
