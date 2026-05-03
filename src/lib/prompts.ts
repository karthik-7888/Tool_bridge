import { getToolById } from "@/lib/tools";
import type { SolveInput } from "@/types";

const ICCAP_KNOWLEDGE = `
ICCAP KNOWLEDGE - DEVICE MODELING:

SETUP:
- Load ICCAP through your institution module system
- Launch with: iccap
- If launch fails: check the module and license
- If startup crashes: check ICCAP_PYTHONHOME points to a valid Python path
- Very large list sweeps can make model files load slowly

LEVEL 1 DIODE MODEL - parameter optimization order:
Never optimize all parameters at once. Use this order:
1. IS - controls overall current level and is the most sensitive parameter
2. N - controls the slope of the log(I) versus V curve
3. RS - only affects the high-current region, so optimize after IS and N
4. CJO - start C-V fitting here
5. VJ - affects the C-V shape
6. M - affects C-V voltage dependence
7. EG - temperature coefficient
8. XTI - optimize last, only for temperature sweeps

WHY THIS ORDER MATTERS:
- If IS is wrong, N optimization often diverges
- RS is mainly a high-current correction, so optimizing it too early gives misleading fits
- Temperature parameters are not useful until the DC curve is already correct

WHAT GOOD CORRELATION LOOKS LIKE:
- I-V: simulated within 2x of measured across all bias points
- C-V: simulated within 10 percent of measured at zero bias
- If off by 100x: IS is wrong, fix it first
- If the I-V slope is wrong: N is wrong
- If the high-current region diverges: RS is wrong
- If the C-V shape is wrong: VJ or M is wrong

NEGATIVE RS AFTER OPTIMIZATION:
- RS must stay physically positive
- If the optimizer gives negative RS: set the lower bound to 0
- This usually means the optimizer is compensating for a bad IS or N fit
- Fix: reset RS to 0, re-optimize IS and N, then allow RS to move again

WHEN C-V DATA IS MISSING:
- You can still extract IS, N, and RS without C-V data
- Set CJO, VJ, and M to reasonable defaults from literature or your course notes
- State clearly in the report that C-V parameters were not optimized due to missing data

N-DIFFUSION RESISTOR MODEL:
- Screen data before optimization
- Plot R versus L at fixed V for each W
- Good data forms straight lines consistent with R = RSH * L/W + 2*Rcont
- Remove outliers, non-monotonic data, and geometry jumps before fitting
- Optimize RSH first, then contact resistance
- Optimize TCR after IV and RV fits
- Optimize VCR last

ICCAP OPTIMIZE DUT WORKFLOW:
1. Select the correct DUT from the tree on the left
2. Verify you did not accidentally select the wrong DUT
3. Set optimization targets for the measured curves you want to fit
4. Set parameter bounds, for example RS lower bound = 0 and IS lower bound = 1e-20
5. Start with a gradient-based optimizer
6. If stuck in a local minimum, switch to a random optimizer briefly, then return to gradient
7. Check correlation visually before saving
8. Save immediately after optimization

PEL TRANSFORMS:
- Used for derived plot variables in geometry scaling plots
- Important for current versus area and current versus perimeter reporting
- Find them in the Transform menu inside ICCAP

SAVING WORK:
- Save frequently because older ICCAP setups can crash
- Export parameters through File menu or model-parameter export
- Export plots as PNG or PDF for reports
- If the session crashes, check autosave or backup directories

COMMON ICCAP MISTAKES:
1. Optimizing all parameters simultaneously
2. Skipping data screening
3. Forgetting to save optimized parameters
4. Selecting the wrong DUT
5. Not using log scale for I-V plots
6. Not checking that the simulation model loads correctly before optimization
7. Leaving parameters unbounded so the optimizer finds unphysical values
`;

const CADENCE_VIRTUOSO_KNOWLEDGE = `
CADENCE VIRTUOSO KNOWLEDGE:

LAUNCH:
- Launch Virtuoso from your working directory, not your home directory
- Command: virtuoso &
- If a previous session crashed, leftover .cdslck files can force read-only behavior
- If a schematic opens read-only, check for stale .cdslck files in library directories

MODEL LIBRARY SETUP:
The error "model not found" usually means one of these:
1. The model path was not added in ADE through Setup -> Model Libraries -> Add Row
2. The section name is wrong, usually it should be tt
3. The path is missing from cds.lib
4. The model file is for a different simulator than the one selected

To find the library path:
- Library Manager -> select library -> Edit -> Properties -> readPath
- Use that path when adding model libraries in ADE

TECHNOLOGY LIBRARY ATTACHMENT:
1. File -> New -> Library
2. Attach to an existing technology
3. Browse to the PDK technology file .tf
4. If the PDK does not appear, ask your lab admin for the installed path

CDS.LIB PROBLEMS:
- cds.lib defines where Virtuoso looks for libraries
- If your libraries disappear after relaunch, you probably launched from the wrong directory
- Use CIW library-path tools to verify all referenced paths still exist

ADE L OR ADE XL SETUP:
1. Tools -> Analog Design Environment
2. Setup -> Simulator/Directory/Host -> choose spectre
3. Setup -> Model Libraries -> add PDK model file
4. Setup -> Stimuli -> Global Sources -> set VDD correctly
5. Analyses -> Choose -> select the simulation type
6. Run -> Netlist and Run

CONVERGENCE ERRORS:
- Check for floating nodes
- Add a large resistor such as 1G ohm from a floating node to ground
- Increase maxiters in convergence options
- Add initial conditions if the circuit has multiple stable states
- Try a small cmin such as 1fF if needed

SAVING OUTPUTS AND WAVEFORMS:
- Waveforms: WaveScan -> File -> Export -> CSV or Raw
- Simulation state: ADE L -> Session -> Save State
- Netlist export: Simulation -> Netlist -> Create
- Save manually before closing

COMMON VIRTUOSO ERRORS:
- "cannot open input file .scs": model path wrong
- "model not found": section name or path wrong
- "cannot open cellview": cds.lib does not include the library path
- "permission denied": copy the design into your own library
- "virtuoso not launching": license issue or bad environment setup
- "ADE XL very slow": reduce sweep points for early debug runs
`;

const SPECTRE_KNOWLEDGE = `
CADENCE SPECTRE KNOWLEDGE:

SIMULATION TYPES:
- DC: operating point and sweeps
- AC: small-signal frequency response
- Transient: time-domain behavior
- Noise: noise spectral density analysis
- Monte Carlo: statistical process variation

VGS VERSUS ID CURVE SETUP:
1. Analyses -> Choose -> dc
2. Sweep the VGS source
3. Use a range from 0 to VDD with a reasonable step like 0.01V
4. Save the drain current output
5. Plot the DC result after simulation

OPAMP AC ANALYSIS:
1. Analyses -> Choose -> ac
2. Set the frequency range, for example 1Hz to 1GHz
3. Plot Vout and read gain crossover
4. Phase margin is the phase at the 0dB crossing

DC CONVERGENCE FIXES:
- Increase maxiters
- Check for floating nodes
- Add initial conditions for bistable circuits
- Try small conductance or capacitance aids only when needed

MONTE CARLO SETUP:
1. ADE XL -> Analyses -> montecarlo
2. Start with around 100 runs for debug
3. Enable both process variation and mismatch
4. Use histograms to inspect the result spread
`;

const CADENCE_RF_KNOWLEDGE = `
CADENCE SPECTRE AND SPECTRERF KNOWLEDGE:

SIMULATION TYPES:
- DC: operating point and sweeps
- AC: small-signal frequency response
- Transient: time-domain behavior
- Noise: noise spectral density
- PSS: Periodic Steady State for oscillators and PLLs
- Pnoise: phase noise, requires PSS first
- Monte Carlo: statistical variation analysis

WHY PSS INSTEAD OF TRANSIENT FOR VCO OR PLL:
- Transient can show oscillation but cannot directly give phase noise
- Transient is slow at RF frequencies
- PSS finds the periodic steady state mathematically and is much faster for RF analysis

PSS SETUP FOR VCO:
1. Run transient first to confirm the oscillator actually starts
2. In ADE: Analyses -> Choose -> pss
3. Set beat frequency to the actual oscillation frequency
4. Set tstab long enough for startup, for example at least 50 cycles
5. Start with errpreset = moderate
6. Shooting Newton is usually right for nonlinear oscillators
7. Harmonic Balance can help for near-sinusoidal LC oscillators

PSS CONVERGENCE FIXES:
- Measure the actual oscillation frequency from transient first
- If dividers are present, the PSS fundamental must match the divided periodicity seen by the whole circuit
- Increase tstab if startup is slow
- Add a small resistor to floating nodes
- Add a very small capacitor in series with inductors if convergence is stubborn
- Try errpreset = liberal if moderate fails
- Switch between Shooting Newton and Harmonic Balance

PNOISE SIMULATION:
1. Run PSS successfully first
2. Analyses -> Choose -> pnoise
3. Set relative harmonic = 1
4. Sweep offset frequency from 1kHz to 100MHz on a log scale
5. Plot phase noise and read PN at 1MHz offset

PHASE-NOISE TARGETS:
- LC VCO target around better than -100 dBc/Hz at 1MHz offset
- Ring oscillator target around better than -80 dBc/Hz at 1MHz offset

FOM CALCULATION:
- FoM = |PN@1MHz| + 20*log10(f0/df) - 10*log10(Pdc_mW)
- FoMT = FoM + 20*log10(FTR/10)
- Keep units consistent before calculating

TUNING RANGE:
1. Sweep Vctrl in a parametric PSS run
2. Extract oscillation frequency at each Vctrl
3. Compute fmax, fmin, fc, and FTR

PLL SIMULATION:
- Use transient to check lock behavior
- Measure lock time from output frequency or control-voltage settling
- Verify PFD polarity, charge-pump direction, and loop bandwidth assumptions

COMMON RF MISTAKES:
- Using AC instead of PSS for oscillators
- Too-short tstab
- Wrong beat frequency
- Reading phase noise at the wrong offset
- Ignoring output buffer loading
- Using inconsistent units in FoM calculations
`;

const CALIBRE_KNOWLEDGE = `
CALIBRE KNOWLEDGE:

SETUP:
- Load the Calibre module through your institution environment
- Launch from Virtuoso through the Calibre menu or use calibre -gui &
- The Help or InfoHub inside Calibre is often worth checking for deck-specific behavior

RUNSET FILES:
- A runset is a saved Calibre configuration
- You do not need one for the first run
- After a successful run, save a runset so you can reproduce settings

DRC WORKFLOW:
1. Open Calibre DRC from Virtuoso
2. Load the PDK DRC rule file
3. Point inputs to the correct GDS or OASIS data
4. Run DRC
5. Use the results viewer to inspect violations
6. Click an error to highlight it back in layout

COMMON DRC ERRORS:
- Metal spacing: move shapes farther apart
- Metal width: widen narrow wires
- Enclosure: increase metal overlap around vias or contacts
- Off-grid: align geometry to the PDK snap grid
- Density: often secondary for student cell-level work unless the assignment explicitly requires fixing it

LVS WORKFLOW:
1. Get DRC reasonably clean first
2. Export layout netlist through Calibre netlist export
3. Export schematic netlist from the schematic side
4. Load both into Calibre LVS
5. Run LVS and inspect transcript plus results viewer

COMMON LVS FAILURES:
- Net mismatch: layout connection does not match schematic
- Device mismatch: wrong W, L, or device type
- Port mismatch: pin labels do not match schematic ports
- Wrong label layer purpose: use the pin purpose, not the drawing purpose
- Multifinger devices may appear as split devices if the PDK recognition rules are not satisfied

SVDB DIRECTORY:
- svdb stores extracted data for LVS
- Keep it between normal reruns
- If LVS starts behaving strangely, delete svdb and rerun from scratch

LICENSE ISSUES:
- If the license is unavailable, wait and retry or use off-peak hours
- Escalate to the lab admin if the problem persists for a long period
`;

const VIVADO_KNOWLEDGE = `
VIVADO KNOWLEDGE:

LAUNCH ISSUES:
- "Exiting with status code -1" usually means disk-space trouble
- Check disk usage
- Clear temporary Vivado files such as /tmp/.Xil*
- Remove stale journals under ~/.Xil if needed
- Do not delete the project .xpr or source directory while cleaning up

BASIC FLOW:
1. Create project and add RTL sources
2. Add XDC constraints
3. Run synthesis and read errors plus critical warnings
4. Run implementation and inspect timing
5. Generate bitstream and program the board

TIMING ANALYSIS:
- WNS must be zero or positive for setup timing to pass
- TNS shows the total amount of negative slack across failing paths
- If the critical path contains CARRY8, investigate adders or subtractors
- If it contains DSP48E2, investigate multipliers or DSP-heavy arithmetic
- High route-delay percentage often points to routing congestion instead of pure logic depth

XDC CONSTRAINTS:
- create_clock -period 10.000 -name clk [get_ports clk]
- set_input_delay -clock clk -max 2.0 [get_ports din]
- set_output_delay -clock clk -max 2.0 [get_ports dout]
- Unconstrained-path warnings usually mean your clock definition does not match the RTL port name

FIXING SETUP VIOLATIONS:
- Add pipeline stages
- Reduce combinational depth
- Trim operand width if the RTL uses wider paths than necessary
- Try stronger implementation strategies only after the RTL and constraints make sense
- Use multicycle exceptions only when the architecture truly allows them

SYNTHESIS-LOG CLUES:
- Inferred latch: incomplete if or case logic
- Unresolved reference: missing module or missing file in project
- Missing constraints: timing analysis is incomplete

PROGRAMMING:
1. Generate bitstream
2. Open Hardware Manager
3. Auto Connect
4. Program Device with the .bit file
5. If the board is not detected, check cable and drivers
`;

const QUARTUS_KNOWLEDGE = `
QUARTUS KNOWLEDGE:

PIN ASSIGNMENT:
1. Assignments -> Pin Planner
2. Find the signal in the Node Name column
3. Set Location using the correct board manual or schematic
4. Recompile after changing pin assignments

TIMEQUEST:
1. Open TimeQuest after compilation
2. Update the timing netlist first
3. Read Fmax Summary
4. Inspect Setup Summary for failing paths
5. Fix issues with constraints or RTL pipelining

SDC BASICS:
- create_clock -period 20.000 [get_ports CLOCK_50]
- set_input_delay -clock CLOCK_50 -max 3 [get_ports SW*]
- set_output_delay -clock CLOCK_50 -max 3 [get_ports LED*]

PLL SETUP:
1. Use PLL IP from the catalog
2. Match the board oscillator frequency
3. Set the target output frequency
4. Instantiate the generated block in top-level RTL

SIGNALTAP:
1. Create a SignalTap file
2. Add the signals you want to capture
3. Set the sample clock and trigger
4. Enable SignalTap in project settings
5. Recompile, program, and run capture

FITTER FAILURES:
- Routing congestion or device overuse are common causes
- Check resource usage in the fitter report
- If logic utilization is very high, reduce area or retarget the device
`;

function getToolKnowledge(toolId: string): string {
  const knowledge: Record<string, string> = {
    iccap: ICCAP_KNOWLEDGE,
    "cadence-virtuoso": CADENCE_VIRTUOSO_KNOWLEDGE,
    "cadence-spectre": SPECTRE_KNOWLEDGE,
    "cadence-rf": CADENCE_RF_KNOWLEDGE,
    calibre: CALIBRE_KNOWLEDGE,
    vivado: VIVADO_KNOWLEDGE,
    quartus: QUARTUS_KNOWLEDGE
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

export function buildSolvePrompt(input: SolveInput): string {
  const tool = getToolById(input.tool);
  const toolName = tool?.name ?? input.tool;
  const toolKnowledge = getToolKnowledge(input.tool);
  const problem = sanitizeUserInput(input.problem);
  const errorMessage = input.errorMessage ? sanitizeUserInput(input.errorMessage) : "";
  const assignmentType = input.assignmentType?.trim() || "";
  const university = input.university?.trim() || "";
  const previousContext = input.previousContext;
  const previousAnswerContext = previousContext
    ? `
This is a follow-up question. Treat it like a student continuing the same conversation.

Previous question:
${sanitizeUserInput(previousContext.problem)}

Previous answer summary:
${sanitizeUserInput(previousContext.summary)}

Previous steps you already gave:
${previousContext.steps
  .slice(0, 6)
  .map((step, index) => `${index + 1}. ${sanitizeUserInput(step.title)} - ${sanitizeUserInput(step.instructions).slice(0, 500)}`)
  .join("\n")}

Previous checkpoint:
${sanitizeUserInput(previousContext.checkpoint)}

Previous next-debugging direction:
${sanitizeUserInput(previousContext.stillStuck)}
`.trim()
    : "No previous answer. This is the first question in the thread.";

  return `
You are a senior engineer and TA who has helped hundreds of EE/ECE students with EDA tool assignments at top engineering universities. You remember exactly how confusing these tools were when you first used them. Your goal is to make the student feel relieved, not more overwhelmed.

YOUR TONE:
- Warm and direct, like a helpful senior who genuinely cares
- Always say "you", never "the student"
- Never say "I don't know", always give the best direction
- Acknowledge that these tools are genuinely non-intuitive
- Make them feel "okay I can do this", not "this is hard"

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

Conversation context:
${previousAnswerContext}

RESPONSE RULES:
- If this is a follow-up, do not restart from scratch
- Answer the follow-up directly in the summary first, then include only the next steps needed from the current point
- Refer naturally to the previous answer as "the earlier steps" or "where you are now" instead of repeating the whole workflow
- Summary: do not restate the problem. Start with what is most likely wrong and what the student should do first
- The first sentence must be the most actionable sentence possible
- If helpful, the second sentence can briefly explain why the issue feels confusing in this tool
- dontDoThis: 2 to 5 specific things not to do first
- Steps: 3 to 8 steps. Use "you" always
- Give full menu paths, for example Setup -> Model Libraries -> Add Row
- Give exact commands where applicable
- If an assignment PDF or error screenshot is attached, use that context together with the typed prompt
- After step 2 or 3, add an inline checkpoint inside instructions: "You are on track if you see X. If you see Y, go back to step Z."
- If a path varies by institution, say that the exact path depends on the lab setup and what to look for
- commonMistakes: 2 to 5 short items specific to this problem
- checkpoint: what success looks like at the end. Be specific
- stillStuck: next debugging direction. End with "Most students solve this in 1 to 2 hours once they follow this order. You are closer than you think."

Return only raw JSON. No markdown. No code fences. No commentary.
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
