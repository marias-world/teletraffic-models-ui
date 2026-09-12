// Runs one seed's Erlang-B simulation off the main thread, so replications
// across several seeds can execute in parallel (across CPU cores) instead
// of one after another on the UI thread.
import {
  runErlangBSimulation,
  ErlangBSimulationParams,
} from "./erlang-b-simulation";

self.onmessage = (event: MessageEvent<ErlangBSimulationParams>) => {
  const result = runErlangBSimulation(event.data);
  self.postMessage(result);
};
