# Resume Studio · Promptlytics

**[Open the public website](https://mayankyadav-ds.github.io/ai-resume-feedback/)** · **[Watch the 132-second reel](https://drive.google.com/file/d/1zRkTnkG0hvn-pARYuM6G4TrsBZcFcgzH/view)**

AI-Powered Resume Feedback & Gap Analysis for placement preparation. Team PE-B49-20, Batch 56. Faculty: Ankit Vijay Bansal. Leader: Akshat Garag.

## Use the website

The public GitHub Pages site runs independently of the developer's computer. No account or key is needed for local analysis, prompt export, manual evidence checking, recorded examples or the evidence dashboard.

1. Paste a resume and target role, or upload a plain-text .txt/.md resume.
2. Analyze recognized skills, common explicit negation, source evidence and gaps.
3. Open Prompt lab to copy/download one of three prompt versions (v3 is final).
4. Generate a private review with the optional on-device SmolLM2 model, use your own Gemini key, or import a response from a chosen assistant.
5. Check evidence and export the reviewed result.

**On-device AI:** requires a WebGPU-capable desktop browser and a first-use model download of hundreds of MB. Model files may be cached; resume text stays on the device. The small model can produce incomplete or semantically weak feedback. The actual first draft failed structure validation; a subsequent structured run passed the contract but used a weak JavaScript evidence quote. This is recorded honestly in test-data/model-runs/on-device-T01.json.

**Gemini:** optional, using a key held only in the current tab or a loopback server environment key. Requests use the visitor's provider quota/billing and require data-sharing consent. No service key is committed. No live Gemini run is claimed.

## Run and verify locally

Node.js 20+. Prebuilt browser assets are committed, so `npm start` and `npm test` need no dependency installation. Open http://127.0.0.1:3000.

```sh
npm test
npm run evaluate
npm run evidence
```

To rebuild the optional on-device bundle, run `npm ci` then `npm run build`. To regenerate PDF documents, install Python reportlab and pymupdf, then run `python code/build-diagrams.py` and `python code/build-docs.py`.

For an optional server-side Gemini key, set `GEMINI_API_KEY` and `GEMINI_MODEL` in the shell before starting the server. `.env` files are not automatically loaded. `node code/run-prompt-experiments.js` can run fictional T01 on Gemini; it may use paid quota. Its outputs must not overwrite the saved Codex experiment without preserving provenance.

## Actual evidence

- 1 final prompt, 3 deliberately saved versions; complete text and rendered input pair saved.
- 3 actual independent Codex research-agent responses for the same fictional T01 pair: v1 free text, v2 JSON with incompatible field shapes, v3 final-contract valid.
- Tool described by the runtime as a GPT-6 family assistant. Exact backend deployment identifier and temperature were not exposed. One run per version is a limited comparison, not a performance benchmark.
- 12 actual local capability inputs: **11 pass and 1 known semantic limitation**. Categories: 4 Normal, 5 Edge, 3 Invalid.
- **17 passing regression tests**, including mock provider transport tests clearly separated from real model runs.
- A captioned **132-second actual browser recording**, captured chronologically at about 2 fps. No mock-up screens or slides replace the working demo.

The keyword score is equal-weight dictionary coverage, **not** an ATS pass rate, hiring prediction or candidate suitability assessment. T08 preserves the failure to assess required experience depth. Quote and numeric-token checks cannot prove semantic truth. Review every suggestion before using it. PDF/DOCX parsing is not in the delivered scope.

## Milestone 2 artifacts

- [Seven-section milestone report](docs/M2_PE-B49-20_AIResumeFeedback.pdf)
- [Two-page technical supporting report](docs/Promptlytics_TechnicalReport.pdf)
- [Actual test table](test-data/results.md)
- [Prompt iteration log](docs/prompt-iteration-log.md)
- [Submission checklist and form values](docs/submission-checklist.md)
- [Captioned demo video](docs/Promptlytics_Demo_Reel.mp4)

The supporting report is reproduced in Section 6 of the milestone report. The deck is saved as a native presentation in the project's Codex chat and can be exported as PowerPoint from its viewer.

## Team and ownership

| Member | Enrollment | Assigned ownership |
|---|---|---|
| Mayank | S24CSEU1494 | Integration and deployment · 20% |
| Uday | S24CSEU1515 | Analysis and evaluation · 20% |
| Purujit | S24CSEU1482 | Prompt design and experiments · 20% |
| Akshat Garag | S24CSEU1486 | Coordination and UI · 20% |
| Ansh | S24CSEU1489 | Quality checks and documentation · 20% |

The project owner requested this equal allocation. Implementation is AI-assisted. These are assigned responsibilities over delivered artifacts, not independent verification of what each teammate personally completed. All members must review and agree before the form's contribution confirmation is ticked. No form submission or approval by all members is claimed. The supplied deadline was 22 November 2026; acceptance of later work is for faculty to determine.

## Privacy

No analytics or application storage for source texts, keys or reviews is used. Clear/reload resets application state; browser form restoration and extensions remain outside the app's control. On-device model files may be cached. Downloaded prompts/reports include supplied content. Direct Gemini requests send the texts and user key to Google only after consent. Real resumes and keys must not be committed. The local server binds to loopback and checks request origin/consent.

## Structure

```text
code/public/           Website, provider adapter, evidence manifest and lazy AI bundle
code/tests/            Regression tests
code/evaluate.js       Reproducible capability evaluation
code/prepare-evidence.js   Saved experiment validation and public manifest
code/build-docs.py     Report generation from actual evidence
prompts/v1/,v2/,v3/,final/  Full prompt texts
test-data/             Fictional inputs, actual outputs and model-run provenance
docs/                  Reports, diagrams, screenshots, demo and project records
CHANGELOG.md           Dated history
```

MIT license. Optional runtime references: [WebLLM](https://webllm.mlc.ai/docs/) and [Gemini generateContent](https://aistudio.google.com/api-reference/generate-content).
