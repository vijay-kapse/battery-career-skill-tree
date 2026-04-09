import { useState, useCallback, useMemo, useRef, useEffect } from "react";

// ── Data ──────────────────────────────────────────────────────────────────────

const DOMAINS = {
  electrochemistry: { label: "Electrochemistry", color: "#4fc3f7", icon: "⚡" },
  manufacturing: { label: "Manufacturing", color: "#ff8a65", icon: "🏭" },
  testing: { label: "Testing & QC", color: "#aed581", icon: "🔬" },
  safety: { label: "Safety & Regulatory", color: "#ffb74d", icon: "🛡️" },
  materials: { label: "Materials Science", color: "#ce93d8", icon: "🧪" },
  data: { label: "Data & Analytics", color: "#4dd0e1", icon: "📊" },
  management: { label: "Project & Operations", color: "#fff176", icon: "📋" },
};

const SKILLS = [
  { id: "cell_fundamentals", name: "Cell Fundamentals", domain: "electrochemistry", tier: 1, x: 0.15, y: 0.2, prereqs: [] },
  { id: "electrode_chemistry", name: "Electrode Chemistry", domain: "electrochemistry", tier: 2, x: 0.08, y: 0.32, prereqs: ["cell_fundamentals"] },
  { id: "electrolyte_systems", name: "Electrolyte Systems", domain: "electrochemistry", tier: 2, x: 0.22, y: 0.30, prereqs: ["cell_fundamentals"] },
  { id: "degradation_mechanisms", name: "Degradation Mechanisms", domain: "electrochemistry", tier: 3, x: 0.12, y: 0.44, prereqs: ["electrode_chemistry"] },
  { id: "next_gen_chemistries", name: "Next-Gen Chemistries", domain: "electrochemistry", tier: 3, x: 0.25, y: 0.42, prereqs: ["electrolyte_systems"] },
  { id: "electrode_processing", name: "Electrode Processing", domain: "manufacturing", tier: 1, x: 0.42, y: 0.12, prereqs: [] },
  { id: "slurry_mixing", name: "Slurry Mixing", domain: "manufacturing", tier: 2, x: 0.35, y: 0.24, prereqs: ["electrode_processing"] },
  { id: "coating_drying", name: "Coating & Drying", domain: "manufacturing", tier: 2, x: 0.50, y: 0.22, prereqs: ["electrode_processing"] },
  { id: "cell_assembly", name: "Cell Assembly", domain: "manufacturing", tier: 2, x: 0.44, y: 0.34, prereqs: ["coating_drying"] },
  { id: "formation_aging", name: "Formation & Aging", domain: "manufacturing", tier: 3, x: 0.38, y: 0.46, prereqs: ["cell_assembly"] },
  { id: "dry_room_ops", name: "Dry Room Operations", domain: "manufacturing", tier: 2, x: 0.55, y: 0.35, prereqs: ["electrode_processing"] },
  { id: "electrical_testing", name: "Electrical Testing", domain: "testing", tier: 1, x: 0.72, y: 0.14, prereqs: [] },
  { id: "cycle_testing", name: "Cycle Life Testing", domain: "testing", tier: 2, x: 0.65, y: 0.26, prereqs: ["electrical_testing"] },
  { id: "impedance_spectroscopy", name: "Impedance Spectroscopy", domain: "testing", tier: 3, x: 0.60, y: 0.38, prereqs: ["cycle_testing"] },
  { id: "failure_analysis", name: "Failure Analysis", domain: "testing", tier: 3, x: 0.72, y: 0.36, prereqs: ["cycle_testing"] },
  { id: "quality_systems", name: "Quality Systems", domain: "testing", tier: 2, x: 0.80, y: 0.25, prereqs: ["electrical_testing"] },
  { id: "battery_safety_basics", name: "Battery Safety Basics", domain: "safety", tier: 1, x: 0.88, y: 0.18, prereqs: [] },
  { id: "thermal_management", name: "Thermal Management", domain: "safety", tier: 2, x: 0.85, y: 0.34, prereqs: ["battery_safety_basics"] },
  { id: "un_dot_compliance", name: "UN/DOT Compliance", domain: "safety", tier: 2, x: 0.92, y: 0.30, prereqs: ["battery_safety_basics"] },
  { id: "abuse_testing", name: "Abuse Testing", domain: "safety", tier: 3, x: 0.88, y: 0.46, prereqs: ["thermal_management"] },
  { id: "cathode_materials", name: "Cathode Materials", domain: "materials", tier: 1, x: 0.18, y: 0.60, prereqs: [] },
  { id: "anode_materials", name: "Anode Materials", domain: "materials", tier: 1, x: 0.10, y: 0.72, prereqs: [] },
  { id: "characterization_techniques", name: "Characterization Techniques", domain: "materials", tier: 2, x: 0.24, y: 0.74, prereqs: ["cathode_materials"] },
  { id: "solid_state", name: "Solid-State Electrolytes", domain: "materials", tier: 3, x: 0.16, y: 0.86, prereqs: ["cathode_materials", "anode_materials"] },
  { id: "data_acquisition", name: "Data Acquisition", domain: "data", tier: 1, x: 0.48, y: 0.58, prereqs: [] },
  { id: "statistical_analysis", name: "Statistical Analysis", domain: "data", tier: 2, x: 0.40, y: 0.70, prereqs: ["data_acquisition"] },
  { id: "battery_modeling", name: "Battery Modeling", domain: "data", tier: 3, x: 0.48, y: 0.82, prereqs: ["statistical_analysis"] },
  { id: "ml_diagnostics", name: "ML Diagnostics", domain: "data", tier: 3, x: 0.55, y: 0.72, prereqs: ["statistical_analysis"] },
  { id: "manufacturing_ops", name: "Manufacturing Ops", domain: "management", tier: 1, x: 0.72, y: 0.58, prereqs: [] },
  { id: "supply_chain", name: "Supply Chain", domain: "management", tier: 2, x: 0.68, y: 0.72, prereqs: ["manufacturing_ops"] },
  { id: "process_engineering", name: "Process Engineering", domain: "management", tier: 2, x: 0.80, y: 0.68, prereqs: ["manufacturing_ops"] },
  { id: "scale_up", name: "Scale-Up & Pilot", domain: "management", tier: 3, x: 0.75, y: 0.84, prereqs: ["process_engineering", "supply_chain"] },
  { id: "program_management", name: "Program Management", domain: "management", tier: 2, x: 0.88, y: 0.62, prereqs: [] },
  { id: "techno_economics", name: "Techno-Economic Analysis", domain: "management", tier: 3, x: 0.90, y: 0.78, prereqs: ["program_management"] },
];

const ARCHETYPES = [
  { id: "researcher", name: "Research Scientist", icon: "🔬", weights: { electrochemistry: 3, materials: 3, data: 2, testing: 1.5 }, description: "Deep expertise in fundamental science and novel materials development." },
  { id: "mfg_engineer", name: "Manufacturing Engineer", icon: "⚙️", weights: { manufacturing: 3, testing: 2, safety: 2, management: 1.5 }, description: "Focused on production processes, yield optimization, and scaling." },
  { id: "test_engineer", name: "Test / Quality Engineer", icon: "📏", weights: { testing: 3, data: 2.5, safety: 2, electrochemistry: 1 }, description: "Specializes in validation, characterization, and quality assurance." },
  { id: "process_tech", name: "Process Technician", icon: "🔧", weights: { manufacturing: 3, safety: 2.5, testing: 1.5 }, description: "Hands-on production line operation and equipment maintenance." },
  { id: "data_scientist", name: "Battery Data Scientist", icon: "🧠", weights: { data: 3, testing: 2, electrochemistry: 1.5, materials: 1 }, description: "Applies modeling, ML, and analytics to battery performance data." },
  { id: "program_lead", name: "Program / Operations Lead", icon: "📋", weights: { management: 3, safety: 2, manufacturing: 1.5, data: 1 }, description: "Oversees projects, supply chains, and cross-functional coordination." },
];

const ROLES = [
  { title: "Battery Cell Test Technician", level: "Entry", archetypes: ["test_engineer", "process_tech"], minSkills: 3, salary: "$42,000 - $55,000", keySkills: ["electrical_testing", "battery_safety_basics", "cycle_testing"], description: "Performs standardized electrical and performance tests on battery cells. Records data, maintains test equipment, and flags anomalies for engineering review.", employers: "Panasonic Energy, AESC, SK On, Samsung SDI" },
  { title: "Electrode Coating Operator", level: "Entry", archetypes: ["process_tech", "mfg_engineer"], minSkills: 3, salary: "$40,000 - $52,000", keySkills: ["electrode_processing", "coating_drying", "battery_safety_basics"], description: "Operates and monitors coating and drying equipment in electrode manufacturing. Adjusts parameters per process specs and performs quality checks on coated foils.", employers: "Tesla Gigafactory, LG Energy Solution, Ultium Cells" },
  { title: "Lab Research Assistant", level: "Entry", archetypes: ["researcher", "data_scientist"], minSkills: 3, salary: "$45,000 - $58,000", keySkills: ["cell_fundamentals", "cathode_materials", "data_acquisition"], description: "Supports R&D scientists with experimental setup, sample preparation, data collection, and analysis. Maintains lab equipment and documents procedures.", employers: "Argonne National Lab, NREL, university research groups" },
  { title: "Quality Control Inspector", level: "Entry", archetypes: ["test_engineer", "mfg_engineer"], minSkills: 4, salary: "$44,000 - $56,000", keySkills: ["quality_systems", "electrical_testing", "battery_safety_basics", "electrode_processing"], description: "Inspects incoming materials and in-process cells against quality standards. Documents non-conformances and supports root cause investigations.", employers: "CATL, BYD, Northvolt, Envision AESC" },
  { title: "Manufacturing Process Engineer", level: "Mid", archetypes: ["mfg_engineer", "process_tech"], minSkills: 7, salary: "$75,000 - $105,000", keySkills: ["electrode_processing", "coating_drying", "cell_assembly", "formation_aging", "slurry_mixing", "dry_room_ops", "quality_systems"], description: "Owns and optimizes specific manufacturing processes. Drives yield improvement, writes process specs, and leads equipment qualifications.", employers: "Tesla, Panasonic, SK Battery America, Rivian" },
  { title: "Cell Test Engineer", level: "Mid", archetypes: ["test_engineer", "data_scientist"], minSkills: 6, salary: "$78,000 - $110,000", keySkills: ["electrical_testing", "cycle_testing", "impedance_spectroscopy", "failure_analysis", "data_acquisition", "statistical_analysis"], description: "Designs and executes test protocols for cell characterization, lifetime prediction, and failure mode identification.", employers: "Rivian, Lucid, Ford Ion Park, GM Ultium" },
  { title: "Materials Characterization Scientist", level: "Mid", archetypes: ["researcher", "test_engineer"], minSkills: 6, salary: "$80,000 - $115,000", keySkills: ["cathode_materials", "anode_materials", "characterization_techniques", "electrode_chemistry", "degradation_mechanisms", "data_acquisition"], description: "Applies SEM, XRD, ICP, and electrochemical techniques to understand material performance and structure-property relationships.", employers: "Argonne, PNNL, QuantumScape, Solid Power" },
  { title: "Battery Data Analyst", level: "Mid", archetypes: ["data_scientist", "test_engineer"], minSkills: 5, salary: "$72,000 - $100,000", keySkills: ["data_acquisition", "statistical_analysis", "cycle_testing", "electrical_testing", "ml_diagnostics"], description: "Builds dashboards, pipelines, and statistical models to extract insight from battery test data.", employers: "Voltaiq, Liminal Insights, Tesla, BMW" },
  { title: "EHS / Safety Specialist", level: "Mid", archetypes: ["program_lead", "mfg_engineer"], minSkills: 5, salary: "$68,000 - $95,000", keySkills: ["battery_safety_basics", "thermal_management", "un_dot_compliance", "abuse_testing", "manufacturing_ops"], description: "Develops and enforces safety protocols for battery manufacturing and testing. Manages compliance with UN/DOT, OSHA, and EHS standards.", employers: "Any gigafactory, UL Solutions, Intertek, national labs" },
  { title: "Production Supervisor", level: "Mid", archetypes: ["program_lead", "process_tech", "mfg_engineer"], minSkills: 6, salary: "$70,000 - $95,000", keySkills: ["manufacturing_ops", "battery_safety_basics", "electrode_processing", "cell_assembly", "quality_systems", "program_management"], description: "Manages shift operations on the production floor. Coordinates technicians, tracks KPIs, and ensures safety and quality compliance.", employers: "Ultium Cells, BlueOval SK, Toyota Battery Manufacturing" },
  { title: "Senior Cell Design Engineer", level: "Senior", archetypes: ["researcher", "mfg_engineer"], minSkills: 10, salary: "$120,000 - $165,000", keySkills: ["cell_fundamentals", "electrode_chemistry", "electrolyte_systems", "cathode_materials", "anode_materials", "coating_drying", "cell_assembly", "formation_aging", "cycle_testing", "failure_analysis"], description: "Leads cell design from concept through pilot production. Selects chemistries, defines electrode specs, and works with manufacturing to scale designs.", employers: "Tesla, QuantumScape, Our Next Energy, Sila Nano" },
  { title: "Principal Scientist, Energy Storage", level: "Senior", archetypes: ["researcher", "data_scientist"], minSkills: 12, salary: "$140,000 - $190,000", keySkills: ["cell_fundamentals", "electrode_chemistry", "electrolyte_systems", "cathode_materials", "anode_materials", "characterization_techniques", "degradation_mechanisms", "next_gen_chemistries", "solid_state", "data_acquisition", "statistical_analysis", "battery_modeling"], description: "Sets strategic research direction for next-gen battery programs. Publishes, patents, and mentors junior researchers.", employers: "National labs, major OEMs, well-funded startups" },
  { title: "Battery Plant Operations Manager", level: "Senior", archetypes: ["program_lead", "mfg_engineer"], minSkills: 10, salary: "$130,000 - $175,000", keySkills: ["manufacturing_ops", "process_engineering", "supply_chain", "program_management", "quality_systems", "battery_safety_basics", "electrode_processing", "cell_assembly", "formation_aging", "scale_up"], description: "Oversees full plant operations including production, quality, maintenance, and logistics.", employers: "Any gigafactory at scale" },
  { title: "Director of Battery Testing", level: "Senior", archetypes: ["test_engineer", "program_lead"], minSkills: 11, salary: "$145,000 - $195,000", keySkills: ["electrical_testing", "cycle_testing", "impedance_spectroscopy", "failure_analysis", "quality_systems", "abuse_testing", "data_acquisition", "statistical_analysis", "program_management", "battery_safety_basics", "thermal_management"], description: "Leads the entire test organization. Defines test strategy, manages lab buildout, and sets standards.", employers: "Major OEMs, Tier 1 suppliers, large startups" },
  { title: "VP of Manufacturing", level: "Executive", archetypes: ["program_lead", "mfg_engineer"], minSkills: 14, salary: "$200,000 - $350,000+", keySkills: ["manufacturing_ops", "process_engineering", "supply_chain", "scale_up", "program_management", "techno_economics", "quality_systems", "battery_safety_basics", "electrode_processing", "coating_drying", "cell_assembly", "formation_aging", "dry_room_ops", "slurry_mixing"], description: "Executive ownership of all manufacturing operations across sites. Sets multi-year capacity strategy and manages capital budgets.", employers: "Northvolt, Tesla, Rivian, SK On, CATL (US ops)" },
];

const TRAINING_MAP = {
  cell_fundamentals: "Battery Academy: Intro to Lithium-Ion Cells",
  electrode_processing: "Battery Academy: Electrode Manufacturing 101",
  electrical_testing: "Battery Academy: Battery Testing Fundamentals (BTEST)",
  battery_safety_basics: "Battery Academy: Battery Safety Essentials",
  data_acquisition: "Battery Academy: Data Acquisition for Battery Testing",
  cathode_materials: "Battery Academy: Cathode Materials Overview",
  manufacturing_ops: "Battery Academy: Gigafactory Operations Intro",
  slurry_mixing: "Battery Academy: Slurry Preparation Lab",
  coating_drying: "Battery Academy: Coating & Drying Processes",
  cell_assembly: "Battery Academy: Cell Assembly Techniques",
  cycle_testing: "Battery Academy: Cycle Life & Performance Testing",
  quality_systems: "Battery Academy: Quality Management for Batteries",
  thermal_management: "Battery Academy: Thermal Safety & Management",
  statistical_analysis: "Coursera: Statistics for Data Science",
  ml_diagnostics: "Coursera: ML for Manufacturing",
  program_management: "LinkedIn Learning: Technical Program Management",
  supply_chain: "edX: Battery Supply Chain & Critical Minerals",
};

const TOTAL_SKILL_POINTS = 12;

function useIsMobile(bp = 768) {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${bp}px)`);
    setM(mq.matches);
    const h = (e) => setM(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, [bp]);
  return m;
}

// ── Components ────────────────────────────────────────────────────────────────

function StarField({ count = 120 }) {
  const stars = useMemo(() => Array.from({ length: count }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 1.5 + 0.3, opacity: Math.random() * 0.5 + 0.1,
    dur: Math.random() * 4 + 3, delay: Math.random() * 5,
  })), [count]);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {stars.map(s => <div key={s.id} style={{ position: "absolute", left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size, borderRadius: "50%", background: "#fff", opacity: s.opacity, animation: `twinkle ${s.dur}s ${s.delay}s infinite ease-in-out` }} />)}
    </div>
  );
}

function LevelRing({ cx, cy, r, level, color }) {
  if (level === 0) return null;
  const gap = 0.08;
  const seg = (Math.PI * 2 - gap * 3) / 3;
  return <g>{[0, 1, 2].map(i => {
    const sa = -Math.PI / 2 + i * (seg + gap), ea = sa + seg, on = i < level;
    return <path key={i} d={`M ${cx + Math.cos(sa) * r} ${cy + Math.sin(sa) * r} A ${r} ${r} 0 0 1 ${cx + Math.cos(ea) * r} ${cy + Math.sin(ea) * r}`}
      fill="none" stroke={on ? color : color + "25"} strokeWidth={on ? 3 : 1.5} strokeLinecap="round" />;
  })}</g>;
}

function SkillNode({ skill, allocated, unlocked, hovered, onHover, onClick, W, H, justClicked }) {
  const d = DOMAINS[skill.domain];
  const px = skill.x * W, py = skill.y * H;
  const on = allocated > 0, r = 18 + allocated * 2;
  const label = allocated === 0 ? "Click to learn" : allocated === 1 ? "★ Beginner" : allocated === 2 ? "★★ Intermediate" : "★★★ Advanced (click to reset)";
  return (
    <g style={{ cursor: unlocked ? "pointer" : "not-allowed" }} opacity={unlocked ? 1 : 0.55}
      onClick={() => unlocked && onClick(skill.id)} onMouseEnter={() => onHover(skill.id)} onMouseLeave={() => onHover(null)}>
      {justClicked && <circle cx={px} cy={py} r={r} fill="none" stroke={d.color} strokeWidth={2} opacity={0}>
        <animate attributeName="r" from={String(r)} to={String(r + 26)} dur="0.4s" fill="freeze" />
        <animate attributeName="opacity" from="0.8" to="0" dur="0.4s" fill="freeze" />
      </circle>}
      {on && <circle cx={px} cy={py} r={r + 8} fill="none" stroke={d.color} strokeWidth={1} opacity={0.25}>
        <animate attributeName="r" values={`${r + 6};${r + 13};${r + 6}`} dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.25;0.08;0.25" dur="3s" repeatCount="indefinite" />
      </circle>}
      <circle cx={px} cy={py} r={r} fill={on ? d.color + "55" : "#2a2a48"} stroke={on ? d.color : "#aabbdd"} strokeWidth={on ? 2.5 : 1.5} />
      <LevelRing cx={px} cy={py} r={r + 5} level={allocated} color={d.color} />
      <circle cx={px} cy={py} r={on ? 4 : 3} fill={on ? d.color : "#dde6f0"}>
        {justClicked && <animate attributeName="r" values="3;6;4" dur="0.3s" fill="freeze" />}
      </circle>
      <text x={px} y={py + r + 14} textAnchor="middle" fill={on ? "#fff" : "#dde6f0"} fontSize="8.5" fontFamily="'JetBrains Mono', monospace" style={{ pointerEvents: "none" }}>{skill.name}</text>
      {hovered && <g>
        <rect x={px - 88} y={py - r - 44} width={176} height={34} rx={4} fill="#111128ee" stroke={d.color + "88"} strokeWidth={1} />
        <text x={px} y={py - r - 28} textAnchor="middle" fill="#f0f0f0" fontSize="10" fontWeight="600" fontFamily="'JetBrains Mono', monospace">{skill.name}</text>
        <text x={px} y={py - r - 16} textAnchor="middle" fill={d.color} fontSize="8" fontFamily="'JetBrains Mono', monospace">{label}</text>
      </g>}
    </g>
  );
}

function ConstellationMap({ skills, allocations, onAllocate, clickedNode }) {
  const ref = useRef(null);
  const [dims, setDims] = useState({ w: 900, h: 580 });
  const [hov, setHov] = useState(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const ro = new ResizeObserver(e => { const w = e[0].contentRect.width; setDims({ w, h: Math.max(440, w * 0.64) }); });
    ro.observe(el); return () => ro.disconnect();
  }, []);
  const unlocked = useMemo(() => {
    const s = new Set();
    skills.forEach(sk => { if (sk.prereqs.length === 0 || sk.prereqs.every(p => (allocations[p] || 0) > 0)) s.add(sk.id); });
    return s;
  }, [skills, allocations]);

  return (
    <div ref={ref} style={{ width: "100%", position: "relative" }}>
      <svg width={dims.w} height={dims.h} viewBox={`0 0 ${dims.w} ${dims.h}`} style={{ display: "block" }}>
        <defs>
          <radialGradient id="n1" cx="30%" cy="25%"><stop offset="0%" stopColor="#4fc3f722" /><stop offset="100%" stopColor="transparent" /></radialGradient>
          <radialGradient id="n2" cx="70%" cy="70%"><stop offset="0%" stopColor="#ce93d818" /><stop offset="100%" stopColor="transparent" /></radialGradient>
        </defs>
        <rect width={dims.w} height={dims.h} fill="transparent" />
        <ellipse cx={dims.w * 0.3} cy={dims.h * 0.28} rx={180} ry={120} fill="url(#n1)" />
        <ellipse cx={dims.w * 0.72} cy={dims.h * 0.7} rx={160} ry={110} fill="url(#n2)" />
        {skills.map(s => s.prereqs.map(pid => {
          const p = skills.find(sk => sk.id === pid); if (!p) return null;
          const active = (allocations[s.id] || 0) > 0 && (allocations[pid] || 0) > 0;
          return <line key={`${pid}-${s.id}`} x1={p.x * dims.w} y1={p.y * dims.h} x2={s.x * dims.w} y2={s.y * dims.h}
            stroke={active ? DOMAINS[s.domain].color : "#667788"} strokeWidth={active ? 2 : 0.8} strokeDasharray={active ? "none" : "4 4"} />;
        }))}
        {Object.entries(DOMAINS).map(([key, d]) => {
          const ds = skills.filter(s => s.domain === key);
          const cx = (ds.reduce((a, s) => a + s.x, 0) / ds.length) * dims.w;
          const cy = (Math.min(...ds.map(s => s.y)) * dims.h) - 28;
          return <text key={key} x={cx} y={cy} textAnchor="middle" fill={d.color} fontSize={dims.w < 600 ? "10" : "13"} fontWeight="700" fontFamily="'JetBrains Mono', monospace" letterSpacing="2">{d.icon} {d.label}</text>;
        })}
        {skills.map(s => <SkillNode key={s.id} skill={s} allocated={allocations[s.id] || 0} unlocked={unlocked.has(s.id)}
          hovered={hov === s.id} onHover={setHov} onClick={onAllocate} W={dims.w} H={dims.h} justClicked={clickedNode === s.id} />)}
      </svg>
    </div>
  );
}

function RadarChart({ scores, size = 210 }) {
  const entries = Object.entries(scores), n = entries.length;
  const cx = size / 2, cy = size / 2, r = size * 0.32;
  const ang = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pts = entries.map(([, v], i) => { const a = ang(i), d = r * Math.min(v, 1); return [cx + Math.cos(a) * d, cy + Math.sin(a) * d]; });
  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ") + "Z";
  const SH = { electrochemistry: "Electro", manufacturing: "Mfg", testing: "Test", safety: "Safety", materials: "Matls", data: "Data", management: "Ops" };
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {[0.25, 0.5, 0.75, 1].map(l => <polygon key={l} points={entries.map((_, i) => { const a = ang(i); return `${cx + Math.cos(a) * r * l},${cy + Math.sin(a) * r * l}`; }).join(" ")} fill="none" stroke="#ffffff15" strokeWidth={0.5} />)}
      {entries.map(([key], i) => { const a = ang(i), lx = cx + Math.cos(a) * (r + 26), ly = cy + Math.sin(a) * (r + 26);
        return <g key={key}><line x1={cx} y1={cy} x2={cx + Math.cos(a) * r} y2={cy + Math.sin(a) * r} stroke="#ffffff18" strokeWidth={0.5} />
          <text x={lx} y={ly} textAnchor="middle" fill={DOMAINS[key]?.color} fontSize="10" fontFamily="'JetBrains Mono', monospace">{DOMAINS[key]?.icon}</text>
          <text x={lx} y={ly + 11} textAnchor="middle" fill={DOMAINS[key]?.color} fontSize="7" fontFamily="'JetBrains Mono', monospace" opacity="0.85">{SH[key]}</text></g>;
      })}
      <path d={pathD} fill="#4fc3f722" stroke="#4fc3f7" strokeWidth={1.5} />
      {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={3} fill={DOMAINS[entries[i][0]]?.color} />)}
    </svg>
  );
}

function RoleCard({ role, allocations, expanded, onToggle }) {
  const LC = { Entry: "#aed581", Mid: "#4fc3f7", Senior: "#ce93d8", Executive: "#ffb74d" };
  const lc = LC[role.level] || "#aaa";
  const ss = (role.keySkills || []).map(sid => { const sk = SKILLS.find(s => s.id === sid); return { id: sid, name: sk?.name || sid, domain: sk?.domain, has: (allocations[sid] || 0) > 0 }; });
  const mc = ss.filter(s => s.has).length, pct = ss.length ? Math.round((mc / ss.length) * 100) : 0;
  return (
    <div style={{ background: expanded ? "#ffffff0c" : "#ffffff06", border: `1px solid ${expanded ? lc + "44" : "#ffffff0a"}`, borderRadius: 8, marginBottom: 6, overflow: "hidden", transition: "all 0.2s" }}>
      <div onClick={onToggle} style={{ padding: "10px 12px", cursor: "pointer" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#f5f8fb", fontFamily: "'JetBrains Mono', monospace" }}>{role.title}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 10, background: lc + "22", color: lc, fontFamily: "'JetBrains Mono', monospace" }}>{role.level}</span>
            <span style={{ fontSize: 10, color: "#8899aa", transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s", display: "inline-block" }}>▾</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
          <div style={{ flex: 1, height: 3, background: "#1a1a2e", borderRadius: 2 }}>
            <div style={{ height: 3, borderRadius: 2, width: `${pct}%`, background: `linear-gradient(90deg, ${lc}, ${lc}88)`, transition: "width 0.5s" }} />
          </div>
          <span style={{ fontSize: 9, color: lc, fontFamily: "'JetBrains Mono', monospace", minWidth: 36, textAlign: "right" }}>{pct}%</span>
        </div>
      </div>
      {expanded && <div style={{ padding: "0 12px 12px", animation: "fadeIn 0.2s ease" }}>
        <p style={{ fontSize: 10, color: "#ccdde8", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.6, margin: "4px 0 10px" }}>{role.description}</p>
        {role.salary && <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, padding: "6px 8px", background: "#ffffff06", borderRadius: 6 }}>
          <span style={{ fontSize: 9, color: "#8899aa", fontFamily: "'JetBrains Mono', monospace" }}>SALARY RANGE</span>
          <span style={{ fontSize: 10, color: "#e8eff5", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{role.salary}</span>
        </div>}
        {role.employers && <div style={{ marginBottom: 10, padding: "6px 8px", background: "#ffffff06", borderRadius: 6 }}>
          <div style={{ fontSize: 9, color: "#8899aa", fontFamily: "'JetBrains Mono', monospace", marginBottom: 3 }}>KEY EMPLOYERS</div>
          <div style={{ fontSize: 9, color: "#ccdde8", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.5 }}>{role.employers}</div>
        </div>}
        <div style={{ fontSize: 9, color: "#8899aa", fontFamily: "'JetBrains Mono', monospace", marginBottom: 6 }}>REQUIRED SKILLS ({mc}/{ss.length})</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {ss.map(s => <span key={s.id} style={{ fontSize: 8, fontFamily: "'JetBrains Mono', monospace", padding: "2px 8px", borderRadius: 10,
            background: s.has ? (DOMAINS[s.domain]?.color || "#4fc3f7") + "22" : "#ffffff08",
            color: s.has ? (DOMAINS[s.domain]?.color || "#4fc3f7") : "#667788",
            border: `1px solid ${s.has ? (DOMAINS[s.domain]?.color || "#4fc3f7") + "44" : "#ffffff10"}`,
          }}>{s.has ? "✓ " : "○ "}{s.name}</span>)}
        </div>
        {ss.filter(s => !s.has).length > 0 && <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 9, color: "#8899aa", fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>FILL THE GAPS</div>
          {ss.filter(s => !s.has).map(s => <div key={s.id} style={{ fontSize: 9, color: "#4fc3f7", fontFamily: "'JetBrains Mono', monospace", padding: "2px 0" }}>→ {TRAINING_MAP[s.id] || `Training: ${s.name}`}</div>)}
        </div>}
      </div>}
    </div>
  );
}

function ProfilePanel({ allocations, panel, setPanel }) {
  const [expRole, setExpRole] = useState(null);
  const totalAllocated = Object.values(allocations).reduce((a, b) => a + b, 0);

  const domainScores = useMemo(() => {
    const sc = {}; Object.keys(DOMAINS).forEach(d => { sc[d] = 0; }); SKILLS.forEach(s => { sc[s.domain] += (allocations[s.id] || 0); });
    const mx = Math.max(...Object.values(sc), 1); Object.keys(sc).forEach(k => { sc[k] /= mx; }); return sc;
  }, [allocations]);

  const archScores = useMemo(() => {
    const rd = {}; Object.keys(DOMAINS).forEach(d => { rd[d] = 0; }); SKILLS.forEach(s => { rd[s.domain] += (allocations[s.id] || 0); });
    return ARCHETYPES.map(a => { let sc = 0; Object.entries(a.weights || {}).forEach(([d, w]) => { sc += (rd[d] || 0) * w; }); return { ...a, score: sc }; }).sort((a, b) => b.score - a.score);
  }, [allocations]);

  const top = archScores[0];
  const roleMatches = useMemo(() => ROLES.map(r => {
    const am = r.archetypes.includes(top.id) ? 1 : 0.3, sf = Math.min(totalAllocated / Math.max(r.minSkills, 1), 1);
    return { ...r, fit: am * 0.6 + sf * 0.4 };
  }).sort((a, b) => b.fit - a.fit).slice(0, 5), [top, totalAllocated]);

  const gaps = useMemo(() => SKILLS.filter(s => !(allocations[s.id] || 0) && (top.weights?.[s.domain] || 0) >= 2).sort((a, b) => a.tier - b.tier).slice(0, 3), [allocations, top]);

  return <>
    <div style={{ display: "flex", borderBottom: "1px solid #ffffff0c", position: "sticky", top: 0, background: "#0e0e1e", zIndex: 5 }}>
      {[["profile", "Career Profile"], ["legend", "Skill Legend"]].map(([k, l]) =>
        <button key={k} onClick={() => setPanel(k)} style={{ flex: 1, padding: "12px 0", fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 1, color: panel === k ? "#4fc3f7" : "#8899aa", background: "none", border: "none", borderBottom: panel === k ? "2px solid #4fc3f7" : "2px solid transparent", cursor: "pointer" }}>{l}</button>
      )}
    </div>
    {panel === "profile" ? <div style={{ padding: "16px 16px 20px" }}>
      {totalAllocated === 0 ? <div style={{ padding: 24, textAlign: "center", color: "#ccdde8" }}><p style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>Allocate skill points on the constellation map to see your career profile</p></div> : <>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 36, marginBottom: 4 }}>{top.icon}</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#f0f0f0", fontFamily: "'Cinzel', serif" }}>{top.name}</div>
          <div style={{ fontSize: 11, color: "#ccdde8", marginTop: 4, fontFamily: "'JetBrains Mono', monospace", maxWidth: 280, margin: "4px auto 0" }}>{top.description}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", margin: "8px 0 16px" }}><RadarChart scores={domainScores} size={200} /></div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: "#8899aa", fontFamily: "'JetBrains Mono', monospace", marginBottom: 8, letterSpacing: 1 }}>ARCHETYPE BLEND</div>
          {archScores.filter(a => a.score > 0).slice(0, 3).map(a => {
            const pct = top.score > 0 ? Math.round((a.score / top.score) * 100) : 0;
            return <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 14 }}>{a.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                  <span style={{ fontSize: 10, color: "#e8eff5", fontFamily: "'JetBrains Mono', monospace" }}>{a.name}</span>
                  <span style={{ fontSize: 10, color: "#4fc3f7", fontFamily: "'JetBrains Mono', monospace" }}>{pct}%</span>
                </div>
                <div style={{ height: 3, background: "#1a1a2e", borderRadius: 2 }}><div style={{ height: 3, background: "linear-gradient(90deg, #4fc3f7, #4fc3f788)", borderRadius: 2, width: `${pct}%`, transition: "width 0.5s" }} /></div>
              </div>
            </div>;
          })}
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: "#8899aa", fontFamily: "'JetBrains Mono', monospace", marginBottom: 8, letterSpacing: 1 }}>TOP ROLE MATCHES (tap to expand)</div>
          {roleMatches.map((r, i) => <RoleCard key={i} role={r} allocations={allocations} expanded={expRole === i} onToggle={() => setExpRole(expRole === i ? null : i)} />)}
        </div>
        {gaps.length > 0 && <div>
          <div style={{ fontSize: 10, color: "#8899aa", fontFamily: "'JetBrains Mono', monospace", marginBottom: 8, letterSpacing: 1 }}>NEXT SKILLS TO UNLOCK</div>
          {gaps.map(s => <div key={s.id} style={{ background: "#ffffff06", border: "1px solid #ffffff0a", borderRadius: 8, padding: "10px 12px", marginBottom: 6 }}>
            <div style={{ fontSize: 11, color: "#f0f4f8", fontFamily: "'JetBrains Mono', monospace" }}>{DOMAINS[s.domain].icon} {s.name}</div>
            {TRAINING_MAP[s.id] && <div style={{ fontSize: 9, color: "#4fc3f7", marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>→ {TRAINING_MAP[s.id]}</div>}
          </div>)}
          <a href="https://nenybatteryacademy.catalog.instructure.com/" target="_blank" rel="noopener noreferrer" style={{ display: "block", textAlign: "center", marginTop: 12, padding: "10px 14px", background: "#4fc3f718", border: "1px solid #4fc3f744", borderRadius: 8, color: "#4fc3f7", fontSize: 10, fontFamily: "'JetBrains Mono', monospace", textDecoration: "none", letterSpacing: 0.5 }}>Browse full Battery Academy catalog →</a>
        </div>}
      </>}
    </div> : <div style={{ padding: "16px 16px" }}>
      {Object.entries(DOMAINS).map(([key, d]) => <div key={key} style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: d.color, fontFamily: "'JetBrains Mono', monospace", marginBottom: 6, letterSpacing: 1 }}>{d.icon} {d.label.toUpperCase()}</div>
        {SKILLS.filter(s => s.domain === key).map(s => <div key={s.id} style={{ fontSize: 10, color: "#eef3f8", fontFamily: "'JetBrains Mono', monospace", padding: "3px 0 3px 12px", borderLeft: `2px solid ${(allocations[s.id] || 0) > 0 ? d.color : "#555"}` }}>
          {"●".repeat(s.tier)}{"○".repeat(3 - s.tier)} {s.name}
          {s.prereqs.length > 0 && <span style={{ color: "#8899aa", marginLeft: 6 }}>← {s.prereqs.map(p => SKILLS.find(sk => sk.id === p)?.name).join(", ")}</span>}
        </div>)}
      </div>)}
    </div>}
  </>;
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function BatterySkillTree() {
  const [alloc, setAlloc] = useState({});
  const [panel, setPanel] = useState("profile");
  const [clicked, setClicked] = useState(null);
  const [mobPanel, setMobPanel] = useState(false);
  const isMob = useIsMobile();
  const used = Object.values(alloc).reduce((a, b) => a + b, 0);
  const rem = TOTAL_SKILL_POINTS - used;

  const handleAlloc = useCallback((id) => {
    setClicked(id); setTimeout(() => setClicked(null), 400);
    setAlloc(prev => {
      const cur = prev[id] || 0;
      if (cur >= 3) { const n = { ...prev }; delete n[id]; return n; }
      const pu = Object.entries(prev).reduce((a, [k, v]) => a + (k === id ? 0 : v), 0);
      if (pu >= TOTAL_SKILL_POINTS) return prev;
      return { ...prev, [id]: cur + 1 };
    });
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a14", color: "#e0e0e0", position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=JetBrains+Mono:wght@300;400;600;700&display=swap');
        @keyframes twinkle{0%,100%{opacity:0.1}50%{opacity:0.6}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#444;border-radius:2px}
      `}</style>
      <StarField />

      <div style={{ position: "relative", zIndex: 2, padding: isMob ? "16px 12px 0" : "24px 24px 0", textAlign: "center" }}>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: isMob ? 15 : 22, fontWeight: 700, color: "#f0f0f0", letterSpacing: 3, marginBottom: 4 }}>⚡ BATTERY CAREER CONSTELLATION</h1>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#8899aa", letterSpacing: 1 }}>Map your skills. Discover your path.</p>
      </div>

      <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: isMob ? "12px 12px" : "16px 24px", flexWrap: "wrap" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#ccdde8" }}>
          SKILL POINTS: <span style={{ color: rem > 0 ? "#4fc3f7" : "#ff8a65", fontWeight: 700 }}>{rem}</span> / {TOTAL_SKILL_POINTS}
        </div>
        <div style={{ width: 100, height: 4, background: "#1a1a2e", borderRadius: 2 }}>
          <div style={{ height: 4, borderRadius: 2, width: `${(used / TOTAL_SKILL_POINTS) * 100}%`, background: rem > 0 ? "linear-gradient(90deg, #4fc3f7, #4dd0e1)" : "linear-gradient(90deg, #ff8a65, #ffb74d)", transition: "width 0.3s" }} />
        </div>
        <button onClick={() => { setAlloc({}); setMobPanel(false); }} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#ccdde8", background: "none", border: "1px solid #555", borderRadius: 4, padding: "4px 10px", cursor: "pointer", letterSpacing: 1 }}>RESET</button>
        {isMob && used > 0 && <button onClick={() => setMobPanel(!mobPanel)} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#4fc3f7", background: "#4fc3f718", border: "1px solid #4fc3f744", borderRadius: 4, padding: "4px 12px", cursor: "pointer", letterSpacing: 1 }}>{mobPanel ? "▲ HIDE PROFILE" : "▼ VIEW PROFILE"}</button>}
      </div>

      {used > 0 && <div style={{ position: "relative", zIndex: 2, display: "flex", flexWrap: "wrap", gap: 5, justifyContent: "center", padding: "0 12px 8px" }}>
        {SKILLS.filter(s => alloc[s.id] > 0).map(s => <span key={s.id} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: DOMAINS[s.domain].color, background: DOMAINS[s.domain].color + "15", border: `1px solid ${DOMAINS[s.domain].color}33`, borderRadius: 12, padding: "3px 8px" }}>
          {s.name} {"★".repeat(alloc[s.id])}
        </span>)}
      </div>}

      <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: isMob ? "column" : "row", padding: isMob ? "0 4px 24px" : "0 12px 24px", minHeight: isMob ? "auto" : 500 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <ConstellationMap skills={SKILLS} allocations={alloc} onAllocate={handleAlloc} clickedNode={clicked} />
          <div style={{ textAlign: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#8899aa", marginTop: 4 }}>Click nodes to cycle: Beginner → Intermediate → Advanced → Reset</div>
        </div>
        {(!isMob || mobPanel) && <div style={{
          width: isMob ? "100%" : 340, minWidth: isMob ? "auto" : 300,
          background: "#0e0e1eee", borderLeft: isMob ? "none" : "1px solid #ffffff0c",
          borderTop: isMob ? "1px solid #ffffff0c" : "none",
          borderRadius: isMob ? "12px 12px 0 0" : "12px 0 0 12px",
          overflow: "auto", maxHeight: isMob ? "70vh" : 750, animation: "fadeIn 0.2s ease",
        }}>
          <ProfilePanel allocations={alloc} panel={panel} setPanel={setPanel} />
        </div>}
      </div>
    </div>
  );
}
