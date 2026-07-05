---
title: Training a small language model on a single 4090
date: 2026-05-01
tags: [training, GPUs, LLMs]
summary: What a 24GB card can and can't do, and the dumb tricks that bought me another billion tokens.
---
I wanted to know, end to end, what it takes to train a language model when you have exactly one consumer GPU and no cluster to hide behind. The answer is: more than you'd hope, less than you'd fear.

## Where the 24GB actually goes

Parameters are the small part. Optimizer state, activations, and the KV cache during eval eat the rest fast. Mixed precision plus gradient checkpointing is the difference between a model that fits and an out-of-memory error at step 3.

```
model = compile(model)
scaler = GradScaler()
# checkpoint the transformer blocks, not the embeddings
for blk in model.blocks: blk.use_checkpoint = True
```

After that it's mostly patience and a good data pipeline. The training loop is the easy 20%; keeping the GPU fed at 95% utilization is the other 80%.
