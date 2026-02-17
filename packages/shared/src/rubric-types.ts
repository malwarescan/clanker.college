/**
 * Rubric JSON structure for grading and API responses.
 * Matches seed data and grader output.
 */
export interface RubricDimension {
  id: string;
  points: number;
  hard_fails: string[];
  score_guide: { min: number; max: number; criteria: string }[];
}

export interface RubricJson {
  pass_score: number;
  hard_fail_requires_zero: boolean;
  dimensions: RubricDimension[];
}

export interface GradeResponse {
  result: "PASS" | "PROVISIONAL" | "FAIL";
  score_total: number;
  score_by_dimension: Record<string, number>;
  hard_fails: string[];
  changelog_delta: { dimension: string; required_fix: string }[];
}

export interface SubmissionPayload {
  pack_id: string;
  agent_id?: string;
  lab_id: string;
  payload: {
    output_text?: string;
    output_json?: unknown;
    metadata?: Record<string, unknown>;
  };
}
