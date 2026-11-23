# Resume Studio

A privacy-first placement preparation project inspired by the **AI-Powered Resume Feedback & Gap Analysis** brief. Paste a resume and target job description to compare recognized skills, review gaps, and prepare evidence-grounded AI feedback.

## Run

Install Node.js 20 or newer, then run:

```sh
npm start
```

Open http://127.0.0.1:3000. No dependencies, API keys, accounts or database are needed. Set `PORT` to change the port. Run `npm test` for the analysis tests.

## What works

- Resume and job description inputs with a fictional sample and input limits.
- Case-insensitive dictionary matching, common aliases and token boundaries.
- Transparent coverage percentage: recognized job skills found in resume / recognized job skills in the description. All skills have equal weight. No recognized skills returns N/A.
- Matched and missing skills with guidance to avoid false claims.
- Up to three conservative edits of existing bullet lines; no invented metrics or skills.
- JSON report export and a structured prompt download for use in a chosen AI assistant.
- Responsive interface, native labels, keyboard focus and live result announcements.

## AI workflow and current limits

This MVP does **not** call an LLM. Local analysis is deterministic, not semantic AI analysis. Download the prompt and use it manually with your chosen model. The prompt requests evidence quotes, gaps, up to three factual rewrites and next steps; source data is separated as JSON. Model instructions mitigate prompt injection but cannot guarantee a third-party model follows them. Review every generated claim.

The keyword score is not an objective measure of candidate ability, an ATS pass rate, or a hiring prediction. The small built-in vocabulary can miss synonyms, negation, proficiency, required-versus-preferred distinctions, and specialist skills. It counts a term wherever it occurs, including in negative statements. Manual review remains necessary. Local edits are simple wording suggestions, not substantive AI rewrites. Only plain-text input is supported; PDF/DOCX extraction and automatic model integration are future work.

## Privacy

Input is held in the current browser tab, with no application storage, analytics or remote requests. The local server serves static assets and never receives the resume text. Clear all or reload to reset application state; browser-managed form restoration, extensions, operating-system tools and downloaded exports are outside this app's control. Downloaded prompts contain the supplied text. Remove contact and sensitive information before sharing a prompt with a third party and review that provider's privacy terms.

Never commit real resumes, prompt exports containing personal data, or credentials. This repository contains fictional examples only; reference screenshots are intentionally excluded. The server binds to loopback and is intended for local use.

## Project structure

```text
public/            Browser interface, analysis engine and prompt builder
server.js          Dependency-free local HTTP server
tests/             Analysis and prompt regression tests
prompts/           Baseline prompt and evaluation guidance
.github/workflows/ Automated tests
```

## Next milestones

1. Add an optional server-side model adapter with schema validation and explicit data-sharing consent.
2. Evaluate semantic feedback against a small, consented and anonymized dataset.
3. Add document parsing, more skill vocabularies and evidence highlighting.

No statistics or competitor claims from the reference brief are presented as verified research. External feedback described in that brief has not been independently collected for this implementation.

## License

MIT. See LICENSE.
