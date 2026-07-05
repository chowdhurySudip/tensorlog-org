---
title: Speculative decoding, explained with a flipbook
date: 2026-04-01
tags: [inference, latency]
summary: A visual walk through draft-and-verify, and why it's basically free latency.
---
Speculative decoding feels like cheating the first time you see it work: a small draft model proposes several tokens, the big model checks them all in one forward pass, and you keep the longest prefix that agrees.

## Why it wins

The expensive model runs the same number of forward passes whether it generates one token or verifies five. If the draft is right most of the time, you get those extra tokens almost for free.

The catch is the draft has to be good enough that its proposals usually survive verification — otherwise you're paying for the draft and getting nothing back.
