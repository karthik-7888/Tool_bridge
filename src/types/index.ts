export type ToolId =
  | "cadence-virtuoso"
  | "cadence-spectre"
  | "cadence-rf"
  | "iccap"
  | "calibre"
  | "vivado"
  | "quartus";

export interface ToolDefinition {
  id: ToolId;
  name: string;
  description: string;
  commonProblems: string[];
}

export interface Step {
  stepNumber: number;
  title: string;
  instructions: string;
  command: string | null;
}

export interface UploadedContextFile {
  name: string;
  mimeType: "application/pdf" | "image/png" | "image/jpeg";
  dataUrl: string;
  size: number;
}

export interface SolveInput {
  tool: ToolId;
  problem: string;
  errorMessage?: string;
  assignmentType?: string;
  university?: string;
  assignmentPdf?: UploadedContextFile;
  errorScreenshot?: UploadedContextFile;
  previousContext?: FollowUpContext;
}

export interface SolveOutput {
  summary: string;
  dontDoThis: string[];
  steps: Step[];
  commonMistakes: string[];
  checkpoint: string;
  stillStuck: string;
}

export interface SavedHistoryItem {
  id: string;
  toolId: string;
  toolName: string;
  problem: string;
  response: SolveOutput;
  createdAt: string;
}

export interface SolvedResult {
  toolName: string;
  response: SolveOutput;
}

export interface FollowUpContext {
  toolName: string;
  problem: string;
  summary: string;
  steps: Array<{
    title: string;
    instructions: string;
  }>;
  checkpoint: string;
  stillStuck: string;
}
