---
title: 'Reading group: the Mamba-2 paper, distilled'
date: 2026-03-01
tags: [SSMs, papers]
summary: State-space models without the linear-algebra cold sweat.
---
Our reading group spent two sessions on Mamba-2, and the thing that finally made it click was reframing the whole structured-state-space machinery as a particular kind of linear attention.

## The one idea to keep

You can write the core update as a matrix that's cheap to apply but expressive enough to carry information across long sequences. Once you see that duality, the rest of the paper is engineering around it.
