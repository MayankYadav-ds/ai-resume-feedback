# Actual local evaluation

T07 and T08 are known semantic limitations, intentionally retained as failed capability tests. No model quality results are claimed.

| Test | Type | Expected | Actual | Result |
|---|---|---|---|---|
| T01 | Normal | {"score":75,"matched":["JavaScript","React","Git"]} | {"score":75,"matched":["JavaScript","React","Git"]} | Pass |
| T02 | Normal | {"score":67,"matched":["Python","SQL"]} | {"score":67,"matched":["Python","SQL"]} | Pass |
| T03 | Normal | {"score":75,"matched":["Node","PostgreSQL","Kubernetes"]} | {"score":75,"matched":["Node","PostgreSQL","Kubernetes"]} | Pass |
| T04 | Normal | {"score":67,"matched":["C++","C#"]} | {"score":67,"matched":["C++","C#"]} | Pass |
| T05 | Edge | {"score":null,"matched":[]} | {"score":null,"matched":[]} | Pass |
| T06 | Edge | {"score":100,"matched":["Python"]} | {"score":100,"matched":["Python"]} | Pass |
| T07 | Edge | {"score":0,"matched":[]} | {"score":100,"matched":["Docker"]} | Fail |
| T08 | Edge | {"score":0,"matched":[]} | {"score":100,"matched":["Python"]} | Fail |
| T09 | Edge | {"score":0,"matched":[]} | {"score":0,"matched":[]} | Pass |
| T10 | Invalid | {"error":"Add both your resume and the job description."} | {"error":"Add both your resume and the job description."} | Pass |
| T11 | Invalid | {"error":"Keep each input under 30,000 characters."} | {"error":"Keep each input under 30,000 characters."} | Pass |
| T12 | Invalid | {"error":"Add both your resume and the job description."} | {"error":"Add both your resume and the job description."} | Pass |
