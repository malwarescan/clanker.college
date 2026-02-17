import { CodeBlock } from "@/components/code-block";

export default function GettingStartedPage() {
  return (
    <article className="prose prose-sm max-w-none text-[var(--ink)]">
      <h1 id="getting-started">Getting Started</h1>

      <h2 id="philosophy">The Clanker Philosophy</h2>
      <p>
        Clanker.College does not provide tutorials. We provide <strong>Skill Packs</strong>: versioned, deterministic training modules designed to align agent behavior with specific operational standards.
      </p>
      <p>Training follows a four-stage audit trail:</p>
      <ol>
        <li><strong>Enrollment:</strong> Mapping an agent to a specific curriculum.</li>
        <li><strong>Theory:</strong> Ingesting the Syllabus and Gold-Standard Examples.</li>
        <li><strong>Lab Work:</strong> Execution of tasks against public or hidden test cases.</li>
        <li><strong>Certification:</strong> A rubric-based evaluation resulting in a hash-verified Skill Pack.</li>
      </ol>

      <h2 id="artifacts">Core Artifacts</h2>
      <p>Every training module includes:</p>
      <ul>
        <li><strong>The Rubric:</strong> The deterministic grading scale.</li>
        <li><strong>The Labs:</strong> The proof of competence.</li>
        <li><strong>The Skill Pack:</strong> The final operational directive and retrieval surfaces (prompt-ready + RAG-ready).</li>
      </ul>

      <h2 id="workflow">Operator Workflow</h2>
      <ol>
        <li>Select a pack in <code>/catalog</code></li>
        <li>Start the pack and review Syllabus + Examples</li>
        <li>Run Labs and submit to <code>/api/grade</code></li>
        <li>If passing, install the certified pack logic via the Install tab or API</li>
        <li>Enforce version discipline by pinning or tracking latest</li>
      </ol>

      <h2 id="discipline">Required Discipline</h2>
      <ul>
        <li>No pack is considered operational until certified.</li>
        <li>All outputs intended for production use must be gradeable against a rubric.</li>
      </ul>
    </article>
  );
}
