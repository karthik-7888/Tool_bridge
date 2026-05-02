import { getToolById } from "@/lib/tools";
import type { SolveInput } from "@/types";

// ============================================
// TOOL-SPECIFIC KNOWLEDGE BASES
// ============================================

const ICCAP_KNOWLEDGE = `
ICCAP-SPECIFIC KNOWLEDGE:

LEVEL 1 DIODE MODEL — Parameter optimization ORDER (critical):
Never optimize all at once. Always follow this order:
1. IS (saturation current) — controls overall current level
2. N (ideality factor) — controls slope of log(I) vs V
3. RS (series resistance) — only affects high current region
4. CJO (zero-bias junction capacitance) — start C-V fitting here
5. VJ (junction potential) — affects C-V shape
6. M (grading coefficient) — affects C-V voltage dependence
7. EG (bandgap energy) — temperature coefficient
8. XTI (temperature exponent) — optimize last, only for temp sweeps

WHAT GOOD CORRELATION LOOKS LIKE:
- I-V: simulated within 2x of measured across all bias points
- C-V: simulated within 10% of measured at zero bias
- If off by 100x: IS is wrong, fix it first before anything else
- If slope is wrong: N is wrong
- If high-current region diverges: RS is wrong

N-DIFFUSION RESISTOR MODEL:
- Screen data first: plot R vs L at fixed V for each W
- Good data: R increases linearly with L
- Bad data: outliers, non-monotonic, jumps — remove before fitting
- Optimize RSH (sheet resistance) first, then contact resistance
- TCR: optimize after IV and RV fits
- VCR: optimize last

ICCAP OPTIMIZE DUT WORKFLOW:
1. Select correct DUT from tree on left panel
2. Set optimization targets — which measured curves to fit
3. Set parameter bounds — use physically reasonable limits
4. Use gradient-based optimizer first
5. If stuck in local minimum: switch to random optimizer to escape
6. Check correlation visually before saving parameters

PEL TRANSFORMS:
- Used to create derived plot variables
- Essential for geometry scaling plots in reports
- Find in: Transform menu inside ICCAP

SAVING IN ICCAP:
- Save frequently — ICCAP can crash unexpectedly on older setups
- Export parameters after optimization via File menu
- Export plots as PNG or PDF for your report

COMMON ICCAP MISTAKES:
- Optimizing all parameters at once — always diverges
- Not checking raw data quality before optimizing
- Forgetting to save optimized parameters
- Wrong DUT selected — you are fitting the wrong device
- Not using log scale for I-V — you miss the subthreshold region
- Skipping data screening for geometry scaling
`;

const CADENCE_VIRTUOSO_KNOWLEDGE = `
CADENCE VIRTUOSO KNOWLEDGE:

MODEL LIBRARY SETUP (most common source of confusion):
1. In ADE L or ADE XL: go to Setup → Model Libraries
2. Click Add Row
3. Browse to your PDK model file (.scs or .lib extension)
4. Set Section name to: tt (typical-typical for nominal)
5. Common mistake: wrong section name causes "model not found"
6. PDK location varies by institution — check with your lab TA

TECHNOLOGY LIBRARY ATTACHMENT:
1. File → New → Library
2. In New Library dialog: choose to attach existing technology
3. Browse to your PDK technology file (.tf)
4. If PDK not listed: ask your lab admin for the correct path
5. After attaching: library appears in Library Manager

SAVING OUTPUTS AND WAVEFORMS:
- Waveforms: in WaveScan → File → Export → CSV or Raw
- Simulation state: ADE L → Session → Save State
- Netlist export: Simulation → Netlist → Create
- Save frequently — long simulations are expensive to re-run

FINDING STANDARD CELLS:
1. Library Manager → search inside your PDK library
2. Filter by cell category: sequential or combinational
3. If cells not visible: verify correct technology library is attached

OPAMP OR COMPLEX BLOCK AS BLACKBOX:
1. Create new cellview → select verilogA as the view type
2. Write Verilog-A model with your target specs as parameters
3. Save inside your local working library
4. Instantiate it like any schematic cell
5. Set parameter values in instance properties dialog

COMMON VIRTUOSO ERRORS:
- "model not found": library path wrong or section name wrong
- "cannot open cellview": check cds.lib includes your library path
- "permission denied": file owned by someone else, copy to your lib
- "virtuoso not launching": check license availability, try later
- "ADE XL very slow": reduce sweep points for initial debug runs
- "schematic not opening": your lab config file may need updating,
  ask your TA for the latest environment setup file
`;

const SPECTRE_KNOWLEDGE = `
CADENCE SPECTRE KNOWLEDGE:

SIMULATION TYPES:
- DC: operating point and sweeps
- AC: small-signal frequency response
- Transient: time-domain behavior
- Noise: noise spectral density analysis
- Monte Carlo: statistical process variation

VGS vs ID CURVE SETUP:
1. ADE L → Analyses → Choose → dc
2. Sweep variable: your VGS voltage source
3. Range: 0 to VDD, step 0.01V
4. Outputs → Save → select drain current of your MOSFET
5. Run → Results → Direct Plot → DC → select ID

OPAMP AC ANALYSIS:
1. Analyses → Choose → ac
2. Frequency range: 1Hz to 1GHz
3. Output: select Vout node
4. After sim: find gain-bandwidth where |gain| crosses 0dB
5. Phase margin: read phase at that same frequency

DC CONVERGENCE FIX:
1. Simulation → Options → Convergence
2. Increase maxiters from 150 to 500
3. Check schematic for floating unconnected nodes
4. Add .ic initial condition if circuit has multiple states

MONTE CARLO SETUP:
1. ADE XL → Analyses → montecarlo
2. numruns: start with 100 for debug, use 500 for final
3. Enable both process variation and device mismatch
4. Results → Histogram to view distribution
`;

const CADENCE_RF_KNOWLEDGE = `
RF AND ANALOG SIMULATION KNOWLEDGE (Cadence Spectre/SpectreRF):

PSS SIMULATION (Periodic Steady State) - needed for VCO/PLL:
- Required before Pnoise analysis
- In ADE L: Analyses -> Choose -> pss
- Set fundamental frequency to your oscillation frequency, for example 2.4GHz
- Set tstab to at least 100 oscillation cycles, for example 100/2.4GHz = 41ns
- Set beat frequency equal to the oscillation frequency
- Use errpreset = moderate for the first run, liberal if convergence issues persist
- If PSS fails to converge, check initial conditions and try liberal preset

PNOISE SIMULATION (Phase Noise):
- Run PSS first because Pnoise depends on the PSS solution
- Analyses -> Choose -> pnoise
- Set relative harmonic to 1 for the fundamental
- Sweep offset frequency from 1kHz to 100MHz on a log scale
- After simulation: Results -> Direct Plot -> Phase Noise
- Read PN at 1MHz as the value at 1MHz offset on the plot
- Units are dBc/Hz

MEASURING PHASE NOISE AT 1MHz OFFSET:
1. Run PSS and then Pnoise
2. Results -> Direct Plot -> Pnoise -> select Phase Noise
3. In the waveform window, place a marker at 1MHz offset
4. Read the y-axis value in dBc/Hz
5. Target for LC VCO is typically better than -100 dBc/Hz
6. Target for ring oscillator is typically better than -80 dBc/Hz

FOM CALCULATION:
- FoM = |PN| + 20*log10(f0/df) - 10*log10(Pdc_mW)
- PN is phase noise at offset df
- f0 is oscillation frequency, for example 2.4GHz
- df is the offset frequency, for example 1MHz
- Pdc_mW is DC power in milliwatts
- Keep units consistent before calculating

TUNING RANGE MEASUREMENT:
1. Sweep Vctrl, the varactor control voltage
2. Plot oscillation frequency versus Vctrl
3. Find fmax and fmin
4. FTR = (fmax - fmin) / fc * 100%
5. fc = (fmax + fmin) / 2
6. For PSS-based measurement, use a parametric sweep on Vctrl

NMOS CROSS-COUPLED LC VCO SETUP:
- Typical topology is cross-coupled NMOS pair plus tail current source plus LC tank
- Inductor Q = 10 means ideal assumptions may be too optimistic, so check what model your lab expects
- Use a PDK varactor when available, otherwise confirm whether MOS capacitor approach is acceptable
- Start L and C from resonance: f = 1/(2*pi*sqrt(LC))
- Tail current can start around 1mA to 2mA, then trade off phase noise versus power

RING OSCILLATOR SETUP:
- A 3-stage inverter ring is the simplest starting point
- For 2.4GHz, each stage delay is approximately 1 / (2*N*f)
- Vctrl usually changes current starving or effective load
- Expect worse phase noise than LC VCO

INTEGER-N PLL DESIGN:
Components usually include:
1. VCO from the earlier assignment
2. Frequency divider divide-by-N, often behavioral at first
3. Phase-frequency detector
4. Charge pump
5. Passive RC loop filter

PLL SIMULATION IN CADENCE:
- Use transient simulation to check lock behavior
- Measure lock time as the time needed for output frequency or control voltage to settle
- Loop bandwidth strongly affects both lock time and phase noise filtering
- Check for PFD dead zone and correct charge pump current polarity

COMMON RF SIMULATION MISTAKES:
- Running AC instead of PSS for an oscillator
- Using too short a tstab so the oscillator has not settled
- Forgetting to set beat frequency in PSS
- Reading phase noise at the wrong offset frequency
- Ignoring output buffer loading on the VCO
- Calculating FoM with inconsistent units
`;

const CALIBRE_KNOWLEDGE = `
CALIBRE KNOWLEDGE:

LOADING CALIBRE:
- Load via your institution module system
- Launch from Virtuoso: Calibre menu → Run DRC or Run LVS
- Standalone launch: calibre -gui &

DRC WORKFLOW:
1. Calibre Interactive → DRC tab
2. Load rule deck: your PDK provides a .drc file
3. Input layout: your GDS or OASIS file
4. Run DRC → open Results Viewer when complete
5. Each error shows rule name and violation location
6. Click any error → Virtuoso highlights the location in layout

LVS WORKFLOW:
1. Calibre Interactive → LVS tab
2. Export layout netlist: in Virtuoso → Calibre → Export Netlist
3. Export schematic netlist: same Calibre menu in schematic
4. Run LVS → check for port mismatches and device mismatches
5. Most common: missing connection, swapped ports, wrong device size

LICENSE ISSUES:
- If license not available: wait a few minutes and retry
- Try during off-peak hours if repeatedly unavailable
- Contact your lab admin if problem persists for hours

UNDERSTANDING DRC ERRORS:
- Metal spacing: two metal shapes too close, move them apart
- Metal width: wire too narrow, widen it
- Enclosure: via not surrounded enough by metal layer
- Density: add or remove metal fill to meet density rules
`;

const VIVADO_KNOWLEDGE = `
VIVADO KNOWLEDGE:

LAUNCH ERRORS:
- "Exiting with status code -1": almost always disk space issue
- Check disk: run df -h in terminal, look for partition near 100%
- Clear Vivado temp: rm -rf /tmp/.Xil* then relaunch
- "No space left on device": old project files filling disk, clean up

BASIC PROJECT FLOW:
1. Create Project → RTL Project → Add your source files
2. Add constraints file (.xdc) for pin and timing
3. Run Synthesis → read log for errors and warnings
4. Run Implementation → check timing summary
5. Generate Bitstream → program your board

TIMING CONSTRAINTS IN XDC:
- Define clock: create_clock -period 10 [get_ports clk]
- Input delay: set_input_delay -clock clk 2 [get_ports din]
- Output delay: set_output_delay -clock clk 2 [get_ports dout]
- If timing fails: relax clock period first to find real slack

READING SYNTHESIS LOG:
- Latch inferred warning: your if or case is incomplete in RTL
- Unresolved reference: module definition missing or not added
- After implementation: check post_synth_timing_summary.rpt

PROGRAMMING THE BOARD:
1. Generate Bitstream — wait for completion
2. Open Hardware Manager → Auto Connect
3. Right-click device → Program Device
4. Select your .bit file → Program
5. Not detected: check USB cable, install Digilent or FTDI driver
`;

const QUARTUS_KNOWLEDGE = `
QUARTUS KNOWLEDGE:

PIN ASSIGNMENT:
1. Assignments → Pin Planner
2. Find your signal in Node Name column
3. Set Location to the correct pin from your board manual
4. Recompile after all pins are assigned

TIMEQUEST FAILING:
1. Tools → TimeQuest Timing Analyzer after compilation
2. Tasks panel → Update Timing Netlist first
3. Fmax Summary → shows achievable clock frequency
4. Failing paths: Reports → Timing → Setup Summary
5. Fix by: tightening constraints, or pipelining RTL

PLL INSTANTIATION:
1. IP Catalog → search PLL → select ALTPLL
2. Set input frequency to match your board oscillator
3. Set output frequency to your target
4. Finish wizard → instantiate generated module in top RTL

SIGNALTAP SETUP:
1. File → New → SignalTap II Logic Analyzer File
2. Add signals you want to capture
3. Set clock and trigger condition
4. Enable SignalTap in project settings
5. Recompile → program board → Run Analysis
`;

// ============================================
// TOOL KNOWLEDGE SELECTOR
// ============================================

function getToolKnowledge(toolId: string): string {
  const knowledge: Record<string, string> = {
    iccap: ICCAP_KNOWLEDGE,
    "cadence-virtuoso": CADENCE_VIRTUOSO_KNOWLEDGE,
    "cadence-spectre": SPECTRE_KNOWLEDGE,
    "cadence-rf": CADENCE_RF_KNOWLEDGE,
    calibre: CALIBRE_KNOWLEDGE,
    vivado: VIVADO_KNOWLEDGE,
    quartus: QUARTUS_KNOWLEDGE,
  };
  return knowledge[toolId] ?? "";
}

function sanitizeUserInput(input: string) {
  return input
    .replace(/ignore\s+(all\s+|previous\s+|above\s+)?instructions/gi, "[removed]")
    .replace(/reveal\s+(your\s+|the\s+)?(system\s+)?prompt/gi, "[removed]")
    .replace(/you\s+are\s+(no\s+longer|now)\s+/gi, "[removed]")
    .replace(/give\s+me\s+(the\s+)?(api\s+key|apikey|secret)/gi, "[removed]")
    .trim();
}

// ============================================
// MAIN PROMPT BUILDER
// ============================================

export function buildSolvePrompt(input: SolveInput): string {
  const tool = getToolById(input.tool);
  const toolName = tool?.name ?? input.tool;
  const toolKnowledge = getToolKnowledge(input.tool);
  const problem = sanitizeUserInput(input.problem);
  const errorMessage = input.errorMessage ? sanitizeUserInput(input.errorMessage) : "";
  const assignmentType = input.assignmentType?.trim() || "";
  const university = input.university?.trim() || "";

  return `
You are a senior engineer and TA who has helped hundreds of 
EE/ECE students with EDA tool assignments at top engineering 
universities. You remember exactly how confusing these tools 
were when you first used them. Your goal is to make the 
student feel relieved, not more overwhelmed.

YOUR TONE:
- Warm and direct, like a helpful senior who genuinely cares
- Always say "you" — never "the student"
- Never say "I don't know" — always give best direction
- Acknowledge that these tools are genuinely non-intuitive
  It is not the student's fault they are confused.
- Make them feel: "okay I can do this" — not "this is hard"

TOOL: ${toolName}

YOUR KNOWLEDGE ABOUT THIS TOOL:
${toolKnowledge}

Student context:
- Problem: ${problem}
- Error message: ${errorMessage || "Not provided"}
- Assignment type: ${assignmentType || "Not provided"}
- University: ${university || "Not provided"}
- Assignment PDF: ${input.assignmentPdf?.name ? `${input.assignmentPdf.name} attached` : "Not provided"}
- Error screenshot: ${input.errorScreenshot?.name ? `${input.errorScreenshot.name} attached` : "Not provided"}

RESPONSE RULES:
- Summary: do NOT restate the problem.
  Start with what is most likely wrong and what the student
  should do first.
  The first sentence must be the most actionable sentence possible.
  If helpful, the second sentence can briefly explain why the
  issue feels confusing in this tool.
- dontDoThis: 2 to 5 specific things NOT to do first.
  Students fear making things worse. This removes that fear.
- Steps: 3 to 8 steps. Use "you" always.
  Give FULL menu paths (Setup → Model Libraries → Add Row).
  Give exact commands where applicable.
  If an assignment PDF or error screenshot is attached, use that context together with the typed prompt.
  After step 2 or 3, add an inline checkpoint inside instructions:
  "You are on track if you see X. If you see Y, go back to step Z."
  If path varies by institution, say:
  "Exact path depends on your lab setup — check with your TA,
   but look for X."
- commonMistakes: 2 to 5 short items specific to this problem.
- checkpoint: what success looks like at the end. Be specific.
- stillStuck: next debugging direction. End with:
  "Most students solve this in 1 to 2 hours once they follow 
   this order. You are closer than you think."

Return ONLY raw JSON. No markdown. No code fences. No commentary.
Exact schema:
{
  "summary": "string",
  "dontDoThis": ["string", "string"],
  "steps": [
    {
      "stepNumber": 1,
      "title": "string",
      "instructions": "string",
      "command": "string or null"
    }
  ],
  "commonMistakes": ["string", "string"],
  "checkpoint": "string",
  "stillStuck": "string"
}
`.trim();
}
