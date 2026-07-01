import { calculateTrafficLoad } from "./traffic-load";
describe("Traffic Load", () => {
  const initialTrafficLoad = 0.7;
  const ramCapacity = 32;
  const serviceClassses = [
    { serviceClass: 1, bu: 1 },
    { serviceClass: 2, bu: 2 },
    { serviceClass: 3, bu: 4 },
  ];
  it("should calculate the correct values", () => {
    const trafficLoad = calculateTrafficLoad(
      initialTrafficLoad,
      ramCapacity,
      serviceClassses,
    );
    expect(trafficLoad).toEqual({
      "1": 7.4666667,
      "2": 3.7333333,
      "3": 1.8666667,
    });
  });
});
