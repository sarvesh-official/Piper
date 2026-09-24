# Open Track submission note — Piper

## The problem

DivyaSree runs on documents. Lease agreements, CAM reconciliation statements, hospitality vendor contracts, facilities SLAs, REVA University compliance paperwork. Most of it lives in PDFs that someone has to open, scroll through, and quote manually every time a question comes up. Piper is my answer to that: upload a document, ask questions, get answers that come from the document itself rather than the model's memory.

## What it does

Users upload PDFs, DOCX, or TXT files. The backend extracts text, chunks it, embeds it with Gemini's embedding model, and stores vectors in Pinecone. When someone asks a question, the query is embedded, matched against the stored chunks, and the retrieved passages go to the LLM (Gemini or Groq) to produce an answer grounded in the actual text. There's also a course and quiz generator on top of the same pipeline, originally built for the learning use case, but the document chat is the core.

## Tradeoffs I made

- I picked Pinecone over a self-hosted vector store. It costs money at scale, but it killed an entire ops surface and let me ship retrieval in days instead of weeks. For a prototype that was the right call; on DivyaSree-scale document volumes I'd revisit it because Pinecone pricing climbs fast.
- The LLM sits behind a provider layer so I can swap between Gemini and Groq per request. Groq is fast and cheap for short answers; Gemini handles longer contexts better. I traded a bit of abstraction complexity for not being locked to one provider's pricing and rate limits.
- Chunking is fixed-size with overlap. Simple, predictable, easy to debug. A smarter strategy like semantic chunking would retrieve better on structured docs, but it's harder to reason about when something goes wrong.

## Where it breaks

- Scanned documents go through Tesseract OCR, and Tesseract struggles with low-quality scans and complex layouts. A lease scanned on a phone at an angle will produce garbage text, and everything downstream inherits that.
- Tables. Lease agreements and CAM statements are table-heavy, and fixed-size chunking slices tables in half. Retrieval on "what's the escalation clause in year 3" will miss if the clause spans a chunk boundary. This is the biggest real weakness and the first thing I'd fix with layout-aware parsing.
- No reranking step. Pinecone returns top-k by cosine similarity and those chunks go straight into the prompt. On large document sets precision drops and the LLM occasionally answers from the wrong document section.
- Documents beyond the context window still need map-reduce style summarization, which I haven't built. Today, very large uploads get truncated.

## Where I did and didn't use AI

AI does two jobs here: embeddings for retrieval, and answer generation over retrieved chunks. Everything else is boring, deterministic code: file parsing, chunking, auth, storage. That was deliberate. I didn't want the model deciding what to store or how to chunk, because those are the parts that need to be debuggable when an answer comes back wrong. The LLM only ever sees content that was already retrieved, which keeps hallucination surface small. When retrieval fails, the failure is visible in the chunks, not hidden inside a model's reasoning.
