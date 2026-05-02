import type { ToolDefinition, ToolId } from "@/types";

export const toolIds = [
  "cadence-virtuoso",
  "cadence-spectre",
  "cadence-rf",
  "iccap",
  "calibre",
  "vivado",
  "quartus"
] as const satisfies readonly ToolId[];

export const supportedTools: ToolDefinition[] = [
  {
    id: "cadence-virtuoso",
    name: "Cadence Virtuoso",
    description: "Schematic capture, ADE setup, layout flows, and library troubleshooting.",
    commonProblems: [
      "I cannot find the 180nm TSMC library in Virtuoso",
      "How do I set up model libraries in ADE L?",
      "Spectre simulation is not running - license error",
      "How do I create a parameterized cell (pcell)?",
      "Layout vs Schematic (LVS) check is failing"
    ]
  },
  {
    id: "cadence-spectre",
    name: "Cadence Spectre",
    description: "Circuit simulation, convergence debugging, sweeps, and analog measurements.",
    commonProblems: [
      "How do I set up a transient simulation in Spectre?",
      "DC operating point is not converging",
      "How do I plot VGS vs ID curve for a MOSFET?",
      "Monte Carlo simulation setup in ADE XL",
      "How do I measure gain and bandwidth of an opamp?"
    ]
  },
  {
    id: "cadence-rf",
    name: "Cadence SpectreRF",
    description: "PSS, Pnoise, VCO, PLL, phase-noise, and RF simulation workflows.",
    commonProblems: [
      "How do I run PSS simulation for my VCO?",
      "How do I measure phase noise at 1MHz offset?",
      "PSS simulation is not converging",
      "How do I calculate FoM from my simulation results?",
      "How do I measure tuning range of my VCO?"
    ]
  },
  {
    id: "iccap",
    name: "ICCAP",
    description: "Device modeling workflows, parameter extraction, and model correlation checks.",
    commonProblems: [
      "How do I load a .mdl file in ICCAP?",
      "What is the correct order to optimize Level 1 diode parameters?",
      "My I-V curve correlation is off by 10x - where to start?",
      "How do I use the Optimize DUT in ICCAP?",
      "What does PEL transform do and how do I use it?"
    ]
  },
  {
    id: "calibre",
    name: "Calibre",
    description: "DRC, LVS, rule deck setup, and interactive verification runs.",
    commonProblems: [
      "Which module do I load for Calibre DRC?",
      "How do I run LVS in Calibre?",
      "Calibre license is not available - what to do?",
      "DRC is showing errors I don't understand",
      "How do I set up Calibre Interactive?"
    ]
  },
  {
    id: "vivado",
    name: "Vivado",
    description: "FPGA synthesis, implementation, XDC constraints, and bitstream generation.",
    commonProblems: [
      "Vivado is exiting with status code -1",
      "No space left on device error in Vivado",
      "How do I add a timing constraint in XDC?",
      "Synthesis is failing - how do I read the log?",
      "How do I generate a bitstream and program the FPGA?"
    ]
  },
  {
    id: "quartus",
    name: "Quartus",
    description: "Pin planning, TimeQuest timing, fitter issues, and on-chip debugging.",
    commonProblems: [
      "How do I assign pins in Quartus Pin Planner?",
      "Timing analysis is failing in TimeQuest",
      "How do I set up a PLL in Quartus?",
      "Fitter is showing routing congestion",
      "How do I use SignalTap logic analyzer?"
    ]
  }
];

export const universityOptions = [
  "IIT Delhi",
  "IIT Bombay",
  "IIT Madras",
  "IIT Kharagpur",
  "BITS Pilani",
  "NIT Trichy",
  "Other"
] as const;

export const assignmentTypes = [
  "Device Modeling",
  "Circuit Simulation",
  "RF / PLL Design",
  "Layout",
  "Timing Analysis",
  "FPGA Implementation",
  "Other"
] as const;

export function getToolById(toolId: ToolId) {
  return supportedTools.find((tool) => tool.id === toolId);
}
