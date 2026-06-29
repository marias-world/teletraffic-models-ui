import { callBlockingProbabilityinRLA } from "../reduced-load-approximation/reduced-load-approximation";
describe("Reduced Load Approximation", () => {
  describe.each([
    {
      description: "2 links and 2 service classes",
      links: [
        { link: 1, bu: 4 },
        { link: 2, bu: 5 },
      ],
      serviceClasses: [
        {
          serviceClass: 1,
          incomingLoad_a: 1,
          route: [
            { link: 1, bu: 1 },
            { link: 2, bu: 1 },
          ],
        },
        {
          serviceClass: 2,
          incomingLoad_a: 1,
          route: [{ link: 2, bu: 2 }],
        },
      ],
      expected: {
        B1: 0.1147916,
        B2: 0.2677767,
      },
    },
    {
      description: "2 links and 2 service classes with different capacities",
      links: [
        { link: 1, bu: 2 },
        { link: 2, bu: 3 },
      ],
      serviceClasses: [
        {
          serviceClass: 1,
          incomingLoad_a: 1,
          route: [
            { link: 1, bu: 1 },
            { link: 2, bu: 1 },
          ],
        },
        {
          serviceClass: 2,
          incomingLoad_a: 1,
          route: [{ link: 2, bu: 2 }],
        },
      ],
      expected: {
        B1: 0.3402666,
        B2: 0.5563373,
      },
    },
    {
      description: "3 links and 2 service classes",
      links: [
        { link: 1, bu: 3 },
        { link: 2, bu: 4 },
        { link: 3, bu: 5 },
      ],
      serviceClasses: [
        {
          serviceClass: 1,
          incomingLoad_a: 1,
          route: [
            { link: 1, bu: 1 },
            { link: 2, bu: 1 },
          ],
        },
        {
          serviceClass: 2,
          bu: 2,
          incomingLoad_a: 1,
          route: [{ link: 2, bu: 2 }],
        },
      ],
      expected: {
        B1: 0.2137616,
        B2: 0.3806593,
      },
    },
    {
      description: "4 links and 3 service classes",
      links: [
        { link: 1, bu: 2 },
        { link: 2, bu: 3 },
        { link: 3, bu: 4 },
        { link: 4, bu: 5 },
      ],
      serviceClasses: [
        {
          serviceClass: 1,
          incomingLoad_a: 1,
          route: [
            { link: 1, bu: 1 },
            { link: 2, bu: 1 },
            { link: 3, bu: 1 },
            { link: 4, bu: 1 },
          ],
        },
        {
          serviceClass: 2,
          incomingLoad_a: 1,
          route: [
            { link: 1, bu: 2 },
            { link: 2, bu: 2 },
          ],
        },
        {
          serviceClass: 3,
          incomingLoad_a: 1,
          route: [
            { link: 3, bu: 1 },
            { link: 4, bu: 1 },
          ],
        },
      ],
      expected: { B1: 0.4621553, B2: 0.764627, B3: 0.0656744 },
    },
    {
      description:
        "2 links and 2 service classes, service class 1 requires different bu from each link",
      links: [
        { link: 1, bu: 4 },
        { link: 2, bu: 5 },
      ],
      serviceClasses: [
        {
          serviceClass: 1,
          incomingLoad_a: 1,
          route: [
            { link: 1, bu: 1 },
            { link: 2, bu: 2 },
          ],
        },
        {
          serviceClass: 2,
          incomingLoad_a: 1,
          route: [{ link: 2, bu: 2 }],
        },
      ],
      expected: {
        B1: 0.4013091,
        B2: 0.399524,
      },
    },
    {
      description:
        "4 links and 3 service classes, service class 2 requires different bu from each link",
      links: [
        { link: 1, bu: 10 },
        { link: 2, bu: 12 },
        { link: 3, bu: 11 },
        { link: 4, bu: 10 },
      ],
      serviceClasses: [
        {
          serviceClass: 1,
          incomingLoad_a: 3,
          route: [
            { link: 1, bu: 1 },
            { link: 2, bu: 1 },
            { link: 3, bu: 1 },
            { link: 4, bu: 2 },
          ],
        },
        {
          serviceClass: 2,
          incomingLoad_a: 1.5,
          route: [
            { link: 1, bu: 2 },
            { link: 2, bu: 2 },
            { link: 3, bu: 2 },
            { link: 4, bu: 2 },
          ],
        },
        {
          serviceClass: 3,
          incomingLoad_a: 1,
          route: [
            { link: 1, bu: 3 },
            { link: 2, bu: 3 },
            { link: 3, bu: 3 },
            { link: 4, bu: 2 },
          ],
        },
      ],
      expected: { B1: 0.3166559, B2: 0.4151443, B3: 0.5325276 },
    },
    {
      description:
        "4 links and 1 service class, 1 service class requires same 1 bu from each link",
      links: [
        { link: 1, bu: 5 },
        { link: 2, bu: 5 },
        { link: 3, bu: 5 },
        { link: 4, bu: 5 },
      ],
      serviceClasses: [
        {
          serviceClass: 1,
          incomingLoad_a: 2,
          route: [
            { link: 1, bu: 1 },
            { link: 2, bu: 1 },
            { link: 3, bu: 1 },
            { link: 4, bu: 1 },
          ],
        },
      ],
      expected: { B1: 0.10759 }, // RLA gives different blocking probability compared to LAR and Kaufman-Roberts model
    },
    {
      description:
        "4 links and 1 service class, 1 service class requires same 1 bu from each link",
      links: [
        { link: 1, bu: 5 },
        { link: 2, bu: 5 },
        { link: 3, bu: 5 },
        { link: 4, bu: 5 },
      ],
      serviceClasses: [
        {
          serviceClass: 1,
          incomingLoad_a: 2,
          route: [
            { link: 1, bu: 2 },
            { link: 2, bu: 2 },
            { link: 3, bu: 2 },
            { link: 4, bu: 2 },
          ],
        },
      ],
      expected: { B1: 0.5965109 }, // RLA gives different blocking probability compared to LAR and Kaufman-Roberts model
    },
  ])(`When $description`, ({ links, serviceClasses, expected }) => {
    it("should calculate the CBP for each service class that traverses the link network topology", () => {
      const result = callBlockingProbabilityinRLA(links, serviceClasses);
      expect(result).toEqual(expected);
    });
  });
});
