const ROUTE_COLORS = [
  "#0ea5e9",
  "#d6a212",
  "#10b981",
  "#a855f7",
  "#f59e0b",
  "#14b8a6",
];

export type DiagramLink = { id: number; capacity: number };
export type DiagramRoute = {
  label: string;
  load: number;
  // bandwidth demanded on each link, keyed by link id
  demands: Record<number, number>;
};

// A simple Cisco-style router glyph: a short cylinder with two opposing
// arrows on top.
function RouterIcon({ x, y }: { x: number; y: number }) {
  const rw = 22;
  return (
    <g>
      {/* cylinder body */}
      <rect x={x - rw} y={y - 8} width={rw * 2} height={16} fill="#eef2f7" />
      <line
        x1={x - rw}
        y1={y - 8}
        x2={x - rw}
        y2={y + 8}
        stroke="#64748b"
        strokeWidth={1.2}
      />
      <line
        x1={x + rw}
        y1={y - 8}
        x2={x + rw}
        y2={y + 8}
        stroke="#64748b"
        strokeWidth={1.2}
      />
      <ellipse
        cx={x}
        cy={y + 8}
        rx={rw}
        ry={6}
        fill="#e2e8f0"
        stroke="#64748b"
        strokeWidth={1.2}
      />
      <ellipse
        cx={x}
        cy={y - 8}
        rx={rw}
        ry={6}
        fill="#f8fafc"
        stroke="#64748b"
        strokeWidth={1.2}
      />
      {/* opposing arrows on the top cap */}
      <g stroke="#64748b" strokeWidth={1.2}>
        <line x1={x - 9} y1={y - 11} x2={x + 9} y2={y - 11} />
        <line x1={x + 9} y1={y - 5} x2={x - 9} y2={y - 5} />
      </g>
      <polygon
        points={`${x + 9},${y - 14} ${x + 9},${y - 8} ${x + 14},${y - 11}`}
        fill="#64748b"
      />
      <polygon
        points={`${x - 9},${y - 8} ${x - 9},${y - 2} ${x - 14},${y - 5}`}
        fill="#64748b"
      />
    </g>
  );
}

export default function NetworkDiagram({
  links,
  routes,
}: {
  links: DiagramLink[];
  routes: DiagramRoute[];
}) {
  const n = links.length;
  if (n === 0) return null;

  // Each link is itself a router/resource, so there is one router per link.
  const marginX = 96;
  const rightMargin = 70;
  const spacing = 150;
  const laneH = 34;
  const topPad = 14;
  const nodeY = topPad + routes.length * laneH + 52;
  const height = nodeY + 66;
  const width = marginX + (n - 1) * spacing + rightMargin;

  const routerX = (i: number) => marginX + i * spacing;
  const rw = 22; // router half-width

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        className="mx-auto max-w-full"
        role="img"
        aria-label="Network of link routers showing where each service class enters and leaves"
      >
        {/* backbone segments between consecutive link routers */}
        {links.slice(0, -1).map((l, i) => (
          <line
            key={`bb-${l.id}`}
            x1={routerX(i) + rw}
            y1={nodeY}
            x2={routerX(i + 1) - rw}
            y2={nodeY}
            stroke="#94a3b8"
            strokeWidth={3}
          />
        ))}

        {/* link routers */}
        {links.map((l, i) => {
          const x = routerX(i);
          return (
            <g key={`link-${l.id}`}>
              <RouterIcon x={x} y={nodeY} />
              <text
                x={x}
                y={nodeY + 30}
                fontSize={12}
                fontWeight={700}
                fill="#475569"
                textAnchor="middle"
              >
                L{l.id}
              </text>
              <text
                x={x}
                y={nodeY + 45}
                fontSize={11}
                fill="#64748b"
                textAnchor="middle"
              >
                C = {l.capacity} b.u.
              </text>
            </g>
          );
        })}

        {/* service-class routes */}
        {routes.map((route, ri) => {
          const color = ROUTE_COLORS[ri % ROUTE_COLORS.length];
          const laneY = topPad + ri * laneH + laneH / 2;
          const usedIdx = links
            .map((l, i) => ({ i, bu: route.demands[l.id] ?? 0 }))
            .filter((u) => u.bu > 0);
          if (usedIdx.length === 0) return null;

          const firstX = routerX(usedIdx[0].i);
          const lastX = routerX(usedIdx[usedIdx.length - 1].i);

          return (
            <g key={`route-${ri}`}>
              {/* gutter label */}
              <text
                x={6}
                y={laneY + 4}
                fontSize={11}
                fontWeight={600}
                fill={color}
              >
                {route.label} · a={route.load}
              </text>

              {/* route bar through the links it uses */}
              {lastX > firstX && (
                <line
                  x1={firstX}
                  y1={laneY}
                  x2={lastX}
                  y2={laneY}
                  stroke={color}
                  strokeWidth={3}
                  strokeLinecap="round"
                />
              )}

              {/* enters: inbound arrow into the first link */}
              <line
                x1={firstX - 26}
                y1={laneY}
                x2={firstX - 8}
                y2={laneY}
                stroke={color}
                strokeWidth={2.5}
              />
              <polygon
                points={`${firstX - 8},${laneY - 5} ${firstX - 8},${laneY + 5} ${firstX - 1},${laneY}`}
                fill={color}
              />

              {/* leaves: outbound arrow after the last link */}
              <line
                x1={lastX}
                y1={laneY}
                x2={lastX + 18}
                y2={laneY}
                stroke={color}
                strokeWidth={2.5}
              />
              <polygon
                points={`${lastX + 18},${laneY - 5} ${lastX + 18},${laneY + 5} ${lastX + 25},${laneY}`}
                fill={color}
              />

              {/* per-link dots, drop lines and bandwidth labels */}
              {usedIdx.map((u) => {
                const x = routerX(u.i);
                return (
                  <g key={`use-${u.i}`}>
                    <line
                      x1={x}
                      y1={laneY}
                      x2={x}
                      y2={nodeY - 16}
                      stroke={color}
                      strokeWidth={1.3}
                      strokeDasharray="3 3"
                      opacity={0.5}
                    />
                    <circle cx={x} cy={laneY} r={4.5} fill={color} />
                    <text
                      x={x}
                      y={laneY - 8}
                      fontSize={10}
                      fill={color}
                      textAnchor="middle"
                    >
                      b={u.bu}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
