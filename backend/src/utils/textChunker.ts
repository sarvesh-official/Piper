/**
 * Splits text into chunks of roughly equal size, trying to break at paragraph boundaries
 * @param text The text to chunk
 * @param maxChunkSize Maximum size of each chunk in bytes
 * @returns Array of text chunks
 */
export function chunkText(text: string, maxChunkSize: number = 50000): string[] {
  if (!text || text.trim().length === 0) {
    return [""];
  }
  
  if (Buffer.byteLength(text, 'utf-8') <= maxChunkSize) {
    return [text];
  }

  const chunks: string[] = [];
  let currentChunk = "";
  
  // Split by paragraphs first
  const paragraphs = text.split(/\n\s*\n/);
  
  for (const paragraph of paragraphs) {
    // Check if adding this paragraph would exceed the chunk size
    if (Buffer.byteLength(currentChunk + paragraph + "\n\n", 'utf-8') > maxChunkSize) {
      // If the current paragraph alone exceeds the chunk size, split by sentences
      if (Buffer.byteLength(paragraph, 'utf-8') > maxChunkSize) {
        const sentences = paragraph.split(/(?<=[.!?])\s+/);
        for (const sentence of sentences) {
          if (Buffer.byteLength(currentChunk + sentence + " ", 'utf-8') > maxChunkSize) {
            if (currentChunk) {
              chunks.push(currentChunk.trim());
              currentChunk = "";
            }
            
            // If a sentence is still too large, split by words
            if (Buffer.byteLength(sentence, 'utf-8') > maxChunkSize) {
              const words = sentence.split(/\s+/);
              for (const word of words) {
                if (Buffer.byteLength(currentChunk + word + " ", 'utf-8') > maxChunkSize) {
                  chunks.push(currentChunk.trim());
                  currentChunk = word + " ";
                } else {
                  currentChunk += word + " ";
                }
              }
            } else {
              currentChunk = sentence + " ";
            }
          } else {
            currentChunk += sentence + " ";
          }
        }
      } else {
        // Save the current chunk and start a new one with this paragraph
        chunks.push(currentChunk.trim());
        currentChunk = paragraph + "\n\n";
      }
    } else {
      currentChunk += paragraph + "\n\n";
    }
  }

  // Add the last chunk if it has content
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.filter(chunk => chunk.trim().length > 0);
};
