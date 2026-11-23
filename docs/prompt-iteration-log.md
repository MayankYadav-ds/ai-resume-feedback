# P1 prompt iteration log

All three versions were deliberately authored and saved on 23 November 2026. These are design iterations, not completed model-quality experiments.

| Version | Change | Why | Observed result / evidence |
|---|---|---|---|
| v1 | Role, comparison, score and three bullet request | Preserve initial project approach | Saved full text; 0 examples; requests a potentially misleading match percentage. No live model run. |
| v2 | JSON fields, no invented skills/metrics, supporting quotes | Make output consumable and reduce unsupported additions | Saved full text; 0 examples; quote-field schema remains underspecified. No live model run. |
| v3 / final | Exact JSON shape, evidence quotes, source-data separation, one example, no ATS prediction | Make evidence checkable and keep source instructions separate | Saved full text; 1 example. Fourteen regression tests pass, including validator and mocked adapter tests. This is software validation, not model performance evidence. No live model run. |

Full text is in `prompts/v1`, `prompts/v2`, `prompts/v3` and `prompts/final`. Final prompt count = 1; saved design versions = 3. No empirical claim that v3 outperforms v1 is made.

To collect actual before/after outputs, configure a Gemini key and enabled model in the shell, then run `node code/run-prompt-experiments.js`. It sends the fictional T01 input three times and saves outputs or errors with timestamps. Inspect each result, update this table with actual observations, and use the same model/settings for all versions. Do not treat mocked provider responses or the manual UI validation fixture as model outputs.
