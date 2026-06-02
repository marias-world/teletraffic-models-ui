import { ServiceClass, ServiceClassWithBR } from "../../models/types";
import { kaufmanRoberts } from "./kaufman-roberts-formula";
import { robertsFormulaBRPolicy } from "./roberts-formula-br-policy";

function isServiceClassWithBR(
  obj: ServiceClass | ServiceClassWithBR,
): obj is ServiceClassWithBR {
  return (obj as ServiceClassWithBR).tk !== undefined;
}

export const callBlockingProbability = (
  capacity: number,
  serviceClasses: ServiceClass[] | ServiceClassWithBR[],
) => {
  if (serviceClasses.length === 0) return {};

  let probabilityValues;
  const BRpolicy = isServiceClassWithBR(serviceClasses[0]);

  if (BRpolicy) {
    probabilityValues = robertsFormulaBRPolicy(
      capacity,
      serviceClasses as ServiceClassWithBR[],
    );
  } else {
    probabilityValues = kaufmanRoberts(capacity, serviceClasses);
  }

  const result: { [key: string]: number } = {};

  serviceClasses.forEach((serviceClass, index) => {
    const requested_bu = serviceClass.bu;
    const tk = (serviceClass as ServiceClassWithBR).tk || 0;
    let cbp = 0;

    for (let j = capacity - requested_bu - tk + 1; j <= capacity; j++) {
      const q_j = probabilityValues[`q(${j})`] || 0;
      cbp += q_j;
    }

    result[`B_class_${index + 1}`] = parseFloat(cbp.toFixed(7));
  });

  return result;
};
