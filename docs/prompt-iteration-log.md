# Actual P1 iteration log

Date: 24 November 2026. Same fictional T01 resume/job pair, three independent Codex research-agent sessions. Platform instructions and inherited defaults apply; exact model deployment identifier and temperature were not exposed. Full rendered prompts and original response content are saved in test-data/model-runs/. JSON whitespace was normalized for v2 without changing its content.

| Version | What changed | Why | Actual observed result |
|---|---|---|---|
| v1 | Role, score and three rewrites | Original baseline | Free text, not JSON. Three alternatives and an unverified Git-on-project assumption, explicitly caveated by the model. Final app contract fails. |
| v2 | JSON fields, quotes, no invented metrics | Make output consumable | JSON parses; summary is an object and quote/rewrite fields use different names. Final app contract fails. |
| v3 / final | Exact contract, source separation, one example | Make evidence checkable | JSON parses and final contract passes. Three skill matches, one gap and one factual rewrite. Six required quotes locate exactly in the source. |

Only one sample was run per version. These observations do not establish statistical improvement, ATS acceptance or hiring success. The separate live on-device test is recorded under on-device-T01.json; it is not passed off as a Codex or Gemini result.
