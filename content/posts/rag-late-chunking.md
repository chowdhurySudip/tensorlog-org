---
title: Why I rebuilt my RAG pipeline around late chunking
date: 2026-06-01
tags: [RAG, retrieval, embeddings]
summary: Embedding the whole document before splitting fixed more retrieval bugs than any reranker I'd tried.
---
For about a year my retrieval setup was the textbook one: split documents into chunks, embed each chunk on its own, store the vectors, retrieve top-k. It worked, mostly. But a specific class of failure kept showing up — questions whose answer was obvious to a human reading the page, yet whose chunk scored badly because the chunk in isolation lost the thread.

The fix that finally stuck was almost embarrassingly simple: embed the full document first, then pool the per-chunk vectors out of that shared context. The chunks stop being amnesiac.

## What late chunking actually does

Instead of cutting first and embedding the pieces, you run the encoder over the whole document so every token attends to everything around it. Only then do you slice the token embeddings into chunk-sized spans and pool them.

```
emb = model.encode(doc)            # encode the WHOLE doc first
spans = splitter.spans(doc)        # then decide on boundaries
chunk_vecs = [pool(emb, s) for s in spans]
```

A pronoun three sentences away, a heading two paragraphs up — those now leak into the chunk vector the way they should. Retrieval recall on my eval set jumped more from this one change than from swapping in a heavier reranker.

> The chunk boundary stopped being a wall the model couldn't see past.

It isn't free — you pay for encoding the full document, and very long docs still need a windowing strategy. But for the 2–20 page PDFs that make up most of my corpus, late chunking is now the default.
