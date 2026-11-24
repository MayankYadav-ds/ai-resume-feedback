# Resume Studio

AI-Powered Resume Feedback & Gap Analysis for placement preparation.

**[Open public prototype](https://mayankyadav-ds.github.io/ai-resume-feedback/)** · [Source repository](https://github.com/MayankYadav-ds/ai-resume-feedback)

## Run locally

Node.js 20+; no npm dependencies. Run `npm start`, then open http://127.0.0.1:3000.

- `npm test`: regression tests for analysis, validation, adapter error handling and local API access.
- `npm run evaluate`: regenerate the twelve-input local capability evaluation.
- `node code/run-prompt-experiments.js`: run v1/v2/v3 on fictional T01 with a configured provider. Requires a key and may use paid quota.

## What works

1. Paste a plain-text resume and job description (30,000 characters each).
2. Review dictionary-based keyword coverage, matched skills and gaps.
3. Select and download one of three prompt versions (v3 is final).
4. Use your selected AI assistant manually, then paste its JSON response.
5. Check schema, exact source quotes and unsupported numbers before exporting.

The public prototype is static. It makes no model/API calls and needs no account. An optional local Gemini adapter is included; live provider testing is pending configuration. Model transport tests use mocks and are labeled accordingly. Manual imports are not evidence of a particular model being run.

## Optional local Gemini integration

In PowerShell, set `GEMINI_API_KEY` and `GEMINI_MODEL` in your shell, then run `npm start`. Use an enabled model identifier from your provider account. The server does not automatically load `.env` files. Never place a key in browser code, GitHub Pages, a public config file or a commit.

The button becomes available only when the local server has both settings and you check the data-sharing consent box. Click **Run local Gemini review** to send the texts to Google. Credentials are used in a server-side request header. No input/output is saved automatically. The experimental adapter uses the documented [generateContent endpoint](https://aistudio.google.com/api-reference/generate-content); compatibility with a selected model, quota and JSON adherence require a real test. Provider errors are shown explicitly.

## Evidence and limitations

The score is the percentage of recognized job-skill dictionary entries also found in the resume, with equal weights. It is **not** an ATS pass rate, hiring prediction or suitability assessment. Unknown vocabulary gives N/A. Negation, proficiency, years of experience and requirement importance are not modeled.

The twelve-input evaluation records **10 passes and 2 semantic capability failures** (negated skills and experience depth). These expected capability failures are separate from the **14 passing regression tests**. Results and full inputs are in `test-data/`. Testing the current dictionary behavior does not prove semantic correctness.

AI-output checks validate structure, exact quotes and numeric overlap. They do not prove semantic entailment or catch invented nonnumeric claims. Prompt injection mitigations are not a guarantee. Review all suggestions yourself. Conservative local wording edits do not fabricate achievements. PDF/DOCX parsing is not implemented.

## Privacy

Local analysis and manual JSON validation execute in the browser tab. No analytics, application storage or saved history is used. Public demo inputs are not uploaded. Clear all or reload resets application state; browser restoration, extensions and downloaded exports remain outside the app's control.

Downloading a prompt or report creates a local file containing supplied text. Sharing a prompt manually, or consenting to a local Gemini call, sends the text to the chosen provider. Remove personal details first and check that provider's privacy terms. The optional server binds to loopback; it is not designed for public server deployment. Do not commit real resumes, credentials or provider exports containing private information.

## Repository structure

```text
prompts/v1/, v2/, v3/   Full historical design versions
prompts/final/          One final prompt (P1)
code/public/           Responsive browser application and validation
code/server.js         Local static server and optional consent-gated API
code/provider.js       Optional Gemini adapter
code/tests/            Regression tests (mock provider transport)
code/evaluate.js       Reproducible local capability evaluation
code/run-prompt-experiments.js  Actual model experiment runner
code/build-docs.py     PDF/diagram generation (Python reportlab + pymupdf)
test-data/             Fictional inputs and actual saved local results
docs/                  Diagrams, screenshots, PDF drafts and readiness notes
CHANGELOG.md           Dated implementation history
```

## Milestone 2 status

Preparation artifacts: [Milestone PDF draft](docs/DRAFT_M2_PENDING_AIResumeFeedback.pdf), [two-page technical report](docs/TeamName_PENDING_TechnicalReport.pdf), [actual evaluation table](test-data/results.md), [prompt iteration log](docs/prompt-iteration-log.md), and [reel recording plan](docs/reel-recording-plan.md).

**Preparation draft, not submission-ready.** See `docs/submission-checklist.md`. The draft reports the actual implemented scope; it does not invent prompt experiment results, team agreement or a reel. One final prompt and three saved design versions exist. Actual live-model iteration results and the final prompt sample run remain pending. A recording plan is provided; there is no finished reel.

Team members supplied on 24 November 2026:

| Member | Enrollment number |
|---|---|
| Mayank | S24CSEU1494 |
| Uday | S24CSEU1515 |
| Purujit | S24CSEU1482 |
| Akshat | S24CSEU1486 |
| Ansh | S24CSEU1489 |

Team ID, team name, faculty, batch, leader designation and actual member contributions: **to be supplied by the team**. No teammate contribution is attributed to AI-generated implementation without their review. Team members must review, understand and agree on their actual work.

The supplied deadline was 22 November 2026, 11:59 PM. This implementation was prepared on 23 November. Ask faculty about acceptance; no submission has been made. No unverified recruitment statistics or external feedback from the original screenshots are presented as research evidence.

## License

MIT. See LICENSE.
