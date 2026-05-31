import Layout from "@/components/layout";
import Link from "next/link";

// ─── small reusable pieces ────────────────────────────────────────────────────
function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-semibold text-slate-700">{children}</h2>;
}

function Tag({
  children,
  color = "sky",
}: {
  children: React.ReactNode;
  color?: "sky" | "emerald" | "amber" | "violet";
}) {
  const styles: Record<string, string> = {
    sky: "bg-sky-50 border-sky-200 text-sky-700",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
    violet: "bg-violet-50 border-violet-200 text-violet-700",
  };
  return (
    <span
      className={`inline-block border rounded-full px-3 py-0.5 text-xs font-semibold ${styles[color]}`}
    >
      {children}
    </span>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────
export default function TeletrafficLossModelsPage() {
  return (
    <Layout>
      <div className="min-h-screen p-10 bg-slate-100">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-md space-y-10">
          {/* Breadcrumb + title */}
          <div>
            <p className="text-sm text-slate-500 mb-2">
              <Link href="/" className="hover:underline">
                Home
              </Link>
              {" / "}
              <span>Theory &amp; Formulas</span>
              {" / "}
              <span className="text-slate-700">Teletraffic Loss Models</span>
            </p>
            <h1 className="text-3xl font-bold text-slate-800">
              Classification of Teletraffic Loss Models
            </h1>
          </div>

          {/* Intro */}
          <section className="space-y-3">
            <p className="text-slate-600 leading-relaxed">
              Not all telephone or data calls behave the same way. A video
              stream, a voice call and a file download each place different
              demands on a network. <strong>Teletraffic loss models</strong>{" "}
              classify these differences so we can predict how often a new call
              will find no resources available and be blocked, and design for it.
            </p>
            <p className="text-slate-600 leading-relaxed">
              There are <strong>three key dimensions</strong> along which any
              call (or connection) can be characterised:
            </p>
            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              {[
                { letter: "a", label: "Call arrival process" },
                { letter: "b", label: "Bandwidth requirements" },
                { letter: "c", label: "Behaviour while in service" },
              ].map(({ letter, label }) => (
                <div
                  key={letter}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4"
                >
                  <div className="text-2xl font-bold text-sky-500 mb-1">
                    ({letter})
                  </div>
                  <div className="text-slate-600">{label}</div>
                </div>
              ))}
            </div>
            <p className="text-slate-500 text-sm italic">
              Different combinations of these three attributes lead to different
              teletraffic models.
            </p>
          </section>

          {/* (a) Call arrival process */}
          <section className="space-y-4">
            <SectionHeading>(a) Call Arrival Process</SectionHeading>
            <p className="text-slate-600">
              Calls can arrive one at a time or in groups, and the pool of
              potential callers can be finite or infinite.
            </p>

            {/* Single vs batch */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Tag color="sky">Single arrival</Tag>
                </div>
                <p className="text-sm text-slate-600">
                  Each call arrives independently. The gaps between arrivals are
                  random, following the familiar Poisson arrival model.
                </p>
                {/* pulse diagram */}
                <svg viewBox="0 0 160 36" className="w-full mt-1">
                  {/* bars: y=11 height=18 → bottom at y=29, just past axis at y=28 */}
                  {[14, 34, 58, 82, 106, 130].map((x) => (
                    <rect
                      key={x}
                      x={x}
                      y={11}
                      width={6}
                      height={18}
                      fill="#38bdf8"
                      rx={1}
                    />
                  ))}
                  {/* axis on top */}
                  <line
                    x1={4}
                    y1={28}
                    x2={152}
                    y2={28}
                    stroke="#cbd5e1"
                    strokeWidth={2}
                  />
                  <text
                    x={152}
                    y={34}
                    fontSize={8}
                    fill="#94a3b8"
                    textAnchor="end"
                  >
                    Time
                  </text>
                </svg>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Tag color="violet">Batch arrival</Tag>
                </div>
                <p className="text-sm text-slate-600">
                  Several calls arrive simultaneously in a group (batch).
                  Batches themselves arrive randomly.
                </p>
                {/* batch pulse diagram — axis at y=28, bars grouped with background */}
                <svg viewBox="0 0 160 40" className="w-full mt-1">
                  {(
                    [
                      [12, [16]],
                      [36, [10, 16, 8]],
                      [80, [16, 10]],
                      [104, [8, 14, 10, 16]],
                      [148, [16]],
                    ] as [number, number[]][]
                  ).map(([startX, heights]) => {
                    const BAR_W = 5;
                    const GAP = 3;
                    const STEP = BAR_W + GAP;
                    const groupW = heights.length * STEP - GAP;
                    const maxH = Math.max(...heights);
                    return (
                      <g key={startX}>
                        {/* light group background — sharp bottom so it meets the axis */}
                        <rect
                          x={startX - 2}
                          y={28 - maxH - 3}
                          width={groupW + 4}
                          height={maxH + 4}
                          fill="#ede9fe"
                          rx={3}
                        />
                        {/* bars: extend 1px past axis so rounded corners don't gap */}
                        {heights.map((h, j) => (
                          <rect
                            key={j}
                            x={startX + j * STEP}
                            y={28 - h}
                            width={BAR_W}
                            height={h + 1}
                            fill="#7c3aed"
                            rx={1}
                          />
                        ))}
                        {/* bracket under multi-call batches */}
                        {heights.length > 1 && (
                          <line
                            x1={startX - 1}
                            y1={30}
                            x2={startX + groupW + 1}
                            y2={30}
                            stroke="#a78bfa"
                            strokeWidth={1.5}
                          />
                        )}
                      </g>
                    );
                  })}
                  {/* axis on top of all bars */}
                  <line
                    x1={4}
                    y1={28}
                    x2={156}
                    y2={28}
                    stroke="#cbd5e1"
                    strokeWidth={2}
                  />
                  <text
                    x={156}
                    y={37}
                    fontSize={8}
                    fill="#94a3b8"
                    textAnchor="end"
                  >
                    Time
                  </text>
                </svg>
              </div>
            </div>

            {/* Three sub-types */}
            <div className="space-y-3">
              {[
                {
                  num: "i",
                  title: "Random calls",
                  sub: "Infinite number of traffic sources",
                  body: "Calls arrive from an unlimited pool of potential users. Each call is independent. The arrival rate is constant, following the classic Poisson process.",
                  color: "bg-sky-50 border-sky-200",
                },
                {
                  num: "ii",
                  title: "Quasi-random calls",
                  sub: "Finite number of traffic sources",
                  body: "Only a limited number of users exist. When more users are already on a call, fewer can generate new ones, so the effective arrival rate drops. This gives rise to the Engset model.",
                  color: "bg-emerald-50 border-emerald-200",
                },
                {
                  num: "iii",
                  title: "Batch Poisson arrivals",
                  sub: "Infinite sources, multiple service-classes",
                  body: "Calls from different service-classes arrive together in batches. The batches themselves arrive according to a Poisson process, but each batch may contain many calls at once.",
                  color: "bg-violet-50 border-violet-200",
                },
              ].map(({ num, title, sub, body, color }) => (
                <div
                  key={num}
                  className={`rounded-xl border p-4 space-y-1 ${color}`}
                >
                  <p className="text-sm font-semibold text-slate-700">
                    ({num}) {title}{" "}
                    <span className="font-normal text-slate-500">({sub})</span>
                  </p>
                  <p className="text-sm text-slate-600">{body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* (b) Bandwidth requirements */}
          <section className="space-y-4">
            <SectionHeading>(b) Bandwidth Requirements</SectionHeading>
            <p className="text-slate-600">
              Once a call is admitted, how much bandwidth does it occupy? Can that amount change?
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <Tag color="sky">Fixed bandwidth</Tag>
                <p className="text-sm text-slate-600">
                  The moment a call starts it is allocated a fixed, unchanging
                  amount of bandwidth for its entire duration. A traditional
                  voice call is the textbook example: 64 kbps from start to
                  finish.
                </p>
                {/* fixed bandwidth diagram */}
                <svg viewBox="0 0 120 28" className="w-full mt-1">
                  {[10, 40, 70, 100].map((x) => (
                    <line
                      key={x}
                      x1={x}
                      y1={22}
                      x2={x}
                      y2={6}
                      stroke="#38bdf8"
                      strokeWidth={4}
                      strokeLinecap="round"
                    />
                  ))}
                  <line
                    x1={4}
                    y1={24}
                    x2={116}
                    y2={24}
                    stroke="#e2e8f0"
                    strokeWidth={1.5}
                  />
                </svg>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <Tag color="emerald">Elastic bandwidth</Tag>
                <p className="text-sm text-slate-600">
                  The call adjusts how much bandwidth it uses depending on what
                  the network can spare. File downloads and adaptive video
                  streams go faster when the network is quiet, slower when it is
                  congested.
                </p>
                {/* elastic bandwidth diagram */}
                <svg viewBox="0 0 120 28" className="w-full mt-1">
                  {[
                    [10, 6],
                    [30, 12],
                    [50, 4],
                    [70, 14],
                    [90, 8],
                    [110, 16],
                  ].map(([x, y], i) => (
                    <line
                      key={i}
                      x1={x}
                      y1={22}
                      x2={x}
                      y2={y}
                      stroke="#34d399"
                      strokeWidth={4}
                      strokeLinecap="round"
                    />
                  ))}
                  <line
                    x1={4}
                    y1={24}
                    x2={116}
                    y2={24}
                    stroke="#e2e8f0"
                    strokeWidth={1.5}
                  />
                </svg>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-slate-700">
              A call may also have{" "}
              <strong>several alternative fixed bandwidth requirements</strong>:
              it tries to get its preferred rate, and falls back to a lower one
              if needed. This sits between fully fixed and fully elastic.
            </div>
          </section>

          {/* (c) Behaviour while in service */}
          <section className="space-y-4">
            <SectionHeading>(c) Behaviour While In Service</SectionHeading>
            <p className="text-slate-600">
              Even after a call is accepted, its bandwidth usage may change over
              time in three distinct ways.
            </p>

            <div className="space-y-3">
              {[
                {
                  num: "i",
                  title: "Stream traffic",
                  badge: <Tag color="sky">Fixed bandwidth allocation</Tag>,
                  body: "The call uses a constant bit rate throughout its lifetime. Classic circuit-switched voice and constant-bitrate video call here. The network must reserve the full bandwidth for the entire call duration.",
                  diagram: (
                    <svg viewBox="0 0 140 28" className="w-full">
                      {[
                        10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130,
                      ].map((x) => (
                        <line
                          key={x}
                          x1={x}
                          y1={22}
                          x2={x}
                          y2={6}
                          stroke="#38bdf8"
                          strokeWidth={3}
                          strokeLinecap="round"
                        />
                      ))}
                      <line
                        x1={4}
                        y1={24}
                        x2={136}
                        y2={24}
                        stroke="#e2e8f0"
                        strokeWidth={1.5}
                      />
                      <text
                        x={1}
                        y={5}
                        fontSize={4}
                        fill="#38bdf8"
                        fontWeight="600"
                      >
                        ON
                      </text>
                    </svg>
                  ),
                },
                {
                  num: "ii",
                  title: "Elastic traffic",
                  badge: (
                    <Tag color="emerald">Bandwidth compression / expansion</Tag>
                  ),
                  body: "The call tolerates its bandwidth being squeezed when the network is busy and expanded when it is free. TCP-based transfers (web, file downloads) are the prime example.",
                  diagram: (
                    <svg viewBox="0 0 140 28" className="w-full">
                      {[
                        [10, 6],
                        [20, 12],
                        [30, 4],
                        [40, 16],
                        [50, 8],
                        [60, 14],
                        [70, 6],
                        [80, 18],
                        [90, 10],
                        [100, 6],
                        [110, 14],
                        [120, 8],
                        [130, 12],
                      ].map(([x, y], i) => (
                        <line
                          key={i}
                          x1={x}
                          y1={22}
                          x2={x}
                          y2={y}
                          stroke="#34d399"
                          strokeWidth={3}
                          strokeLinecap="round"
                        />
                      ))}
                      <line
                        x1={4}
                        y1={24}
                        x2={136}
                        y2={24}
                        stroke="#e2e8f0"
                        strokeWidth={1.5}
                      />
                    </svg>
                  ),
                },
                {
                  num: "iii",
                  title: "ON-OFF traffic",
                  badge: (
                    <Tag color="amber">Alternating active / silent periods</Tag>
                  ),
                  body: "The call alternates between active (ON) bursts at a fixed rate and silent (OFF) gaps with zero transmission. Bandwidth is only occupied during the ON periods.",
                  diagram: (
                    <svg viewBox="0 0 160 38" className="w-full">
                      {/*
                        Axis at y=28. Bars from y=14 to y=29 (1px past axis).
                        ON Group 1 : x = 8, 15, 22        centre ≈ 17
                        OFF gap 1  : x = 28 → 54          centre ≈ 41
                        ON Group 2 : x = 56, 63, 70, 77   centre ≈ 66
                        OFF gap 2  : x = 83 → 108         centre ≈ 95
                        ON Group 3 : x = 110, 117, 124    centre ≈ 119
                      */}
                      {[8, 15, 22, 56, 63, 70, 77, 110, 117, 124].map((x) => (
                        <rect
                          key={x}
                          x={x}
                          y={14}
                          width={5}
                          height={15}
                          fill="#f59e0b"
                          rx={1}
                        />
                      ))}
                      {/* axis drawn last so it sits on top of bars */}
                      <line
                        x1={4}
                        y1={28}
                        x2={156}
                        y2={28}
                        stroke="#cbd5e1"
                        strokeWidth={2}
                      />
                      {/* ON labels — all at y=10, centred over each group */}
                      <text
                        x={17}
                        y={10}
                        fontSize={4}
                        fill="#f59e0b"
                        fontWeight="700"
                        textAnchor="middle"
                      >
                        ON
                      </text>
                      <text
                        x={66}
                        y={10}
                        fontSize={4}
                        fill="#f59e0b"
                        fontWeight="700"
                        textAnchor="middle"
                      >
                        ON
                      </text>
                      <text
                        x={119}
                        y={10}
                        fontSize={4}
                        fill="#f59e0b"
                        fontWeight="700"
                        textAnchor="middle"
                      >
                        ON
                      </text>
                      {/* OFF labels — all at y=22, centred in each silent gap */}
                      <text
                        x={41}
                        y={22}
                        fontSize={4}
                        fill="#94a3b8"
                        textAnchor="middle"
                      >
                        OFF
                      </text>
                      <text
                        x={95}
                        y={22}
                        fontSize={4}
                        fill="#94a3b8"
                        textAnchor="middle"
                      >
                        OFF
                      </text>
                      <text
                        x={156}
                        y={36}
                        fontSize={4}
                        fill="#94a3b8"
                        textAnchor="end"
                      >
                        Time
                      </text>
                    </svg>
                  ),
                },
              ].map(({ num, title, badge, body, diagram }) => (
                <div
                  key={num}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-slate-700">
                      ({num}) {title}
                    </span>
                    {badge}
                  </div>
                  <p className="text-sm text-slate-600">{body}</p>
                  {diagram}
                </div>
              ))}
            </div>
          </section>

          {/* ON-OFF deep dive */}
          <section className="space-y-4">
            <SectionHeading>
              ON-OFF Traffic in Practice: Video Streaming
            </SectionHeading>
            <p className="text-slate-600">
              Adaptive Bitrate video streaming is the classic real-world example
              of ON-OFF traffic.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
                <p className="font-semibold text-emerald-700 text-sm">
                  → ON period (active transmission)
                </p>
                <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                  <li>The player downloads one video segment at a time.</li>
                  <li>
                    The connection is active and data flows at a fixed rate set
                    by the video quality.
                  </li>
                  <li>
                    The network allocates a fixed amount of bandwidth for this
                    burst.
                  </li>
                </ul>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <p className="font-semibold text-slate-500 text-sm">
                  → OFF period (no transmission)
                </p>
                <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                  <li>
                    The segment is being played back. No more data is needed
                    until the next segment starts.
                  </li>
                  <li>
                    During this time the connection goes idle; no bandwidth is
                    consumed.
                  </li>
                  <li>
                    The network can use that freed capacity for other users.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* ISP example */}
          <section className="space-y-4">
            <SectionHeading>
              Real-World Example: ISP with Mixed Traffic
            </SectionHeading>
            <p className="text-slate-600">
              Consider an internet service provider managing two very different
              types of traffic simultaneously.
            </p>

            <div className="space-y-3">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-1">
                <div className="flex items-center gap-2">
                  <Tag color="amber">Video streams (ON-OFF)</Tag>
                </div>
                <ul className="text-sm text-slate-600 mt-2 space-y-1 list-disc list-inside">
                  <li>
                    Each stream requires a fixed <strong>5 Mbps</strong> during
                    its ON bursts.
                  </li>
                  <li>
                    The exact moment a user starts a stream is unpredictable
                    (random arrival), but once started it consistently uses 5
                    Mbps per ON period.
                  </li>
                </ul>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-1">
                <div className="flex items-center gap-2">
                  <Tag color="emerald">File downloads (elastic)</Tag>
                </div>
                <ul className="text-sm text-slate-600 mt-2 space-y-1 list-disc list-inside">
                  <li>
                    Downloads expand to use whatever spare bandwidth is
                    available.
                  </li>
                  <li>
                    When the network is busy, downloads slow down. No call is
                    blocked; it just gets fewer resources.
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-slate-700 space-y-1">
                <p className="font-semibold">→ Network management</p>
                <p>
                  The provider allocates bandwidth to each stream or download
                  based on its requirements. Once a video session is allocated
                  its 5 Mbps slice, that allocation does not change for the
                  duration of the session, even as file downloads shrink and
                  grow around it.
                </p>
              </div>
            </div>
          </section>

          {/* Reference */}
          <section className="space-y-3">
            <SectionHeading>Reference</SectionHeading>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-600 space-y-1">
              <p className="font-medium text-slate-700">
                Michael Logothetis, Ioannis D. Moscholios
              </p>
              <p className="italic">
                Efficient Multirate Teletraffic Loss Models Beyond Erlang
              </p>
              <p>Wiley-IEEE Press, 2019.</p>
              <a
                href="https://onlinelibrary.wiley.com/doi/book/10.1002/9781119426974"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-600 hover:underline break-all"
              >
                https://onlinelibrary.wiley.com/doi/book/10.1002/9781119426974
              </a>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
