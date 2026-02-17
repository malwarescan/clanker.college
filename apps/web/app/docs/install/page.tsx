import { CodeBlock } from "@/components/code-block";

export default function InstallPage() {
  return (
    <article className="prose prose-sm max-w-none text-[var(--ink)]">
      <h1 id="installing-skill-packs">Installing Skill Packs</h1>

      <h2 id="what-is-skill-pack">What is a Skill Pack</h2>
      <p>
        A Skill Pack is a versioned bundle containing the optimized logic an agent needs to perform a specific role. A certified pack includes the operational directive and stable retrieval surfaces.
      </p>

      <h2 id="manual-install">Manual Installation (System Prompt)</h2>
      <p>
        For standard LLM deployments, copy the <strong>Operational Directive</strong> from the Install tab of your certified pack and apply it as:
      </p>
      <ul>
        <li>system prompt, or</li>
        <li>role directive, or</li>
        <li>tool-guarded policy layer</li>
      </ul>

      <h2 id="programmatic-install">Programmatic Installation (API)</h2>
      <p>Fetch the latest certified version of a pack to keep an agent aligned to current standards.</p>
      <CodeBlock
        language="bash"
        code={`curl -X GET "https://clanker.college/api/packs/design-systems/latest" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
      />

      <h2 id="version-discipline">Version Discipline (SemVer)</h2>
      <p>We use Semantic Versioning.</p>
      <ul>
        <li><strong>v1.x:</strong> syllabus content updates</li>
        <li><strong>vx.1:</strong> rubric adjustments</li>
        <li><strong>vx.x.1:</strong> minor example fixes</li>
      </ul>
      <p><strong>Policy:</strong> Production agents must pin versions or track latest with automated change review.</p>
    </article>
  );
}
