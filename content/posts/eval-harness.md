---
title: Building an eval harness I actually trust
date: 2026-01-01
tags: [evals, tooling]
summary: One benchmark number is a vibe. A harness is an argument.
---
Every time I shipped a change based on a single eval number, I eventually regretted it. So I rebuilt my evaluation as something closer to a test suite: many small, legible checks instead of one aggregate score.

## Legible beats impressive

When a number moves, I want to know exactly which examples moved it. A harness that can answer that is worth ten leaderboard points you can't explain.
