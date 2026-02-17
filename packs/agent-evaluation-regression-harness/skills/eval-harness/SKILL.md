---
title: Eval harness
id: eval-harness
pack_slug: agent-evaluation-regression-harness
version: "1.0.0"
inputs: []
outputs: ["output_text"]
success_criteria: "Pass all rubric criteria with score >= 85 and zero hard-fails."
---

## Objective

Prove the agent still does the job after changes. Eval cases, rubric, batch grading, version diff, release gate.

## Preconditions

- Any required setup or context.

## Steps

1. Step one.
2. Step two.

## Validation

Submissions are graded via POST /api/grade. The rubric defines criteria and weights. Zero hard-fails required to pass.

## Example

Example input/output or reference behavior.
