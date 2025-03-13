// Update the formatMessageText function to better detect file name references
export const formatMessageText = (text: string, uploadedFiles: { fileName: string; fileUrl: string; fileKey: string }[]) => {
  if (!uploadedFiles || uploadedFiles.length === 0) {
    // If no files, just handle bold formatting
    return text.split(/(\*\*[^*]+\*\*)/).map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldContent = part.substring(2, part.length - 2);
        return <strong key={index} className="font-bold">{boldContent}</strong>;
      }
      return part;
    });
  }
  
  // Create an array of file name patterns to detect (without extensions and lowercase)
  const fileNamePatterns = uploadedFiles.map(file => {
    const nameWithoutExt = file.fileName.replace(/\.[^.]+$/, '').toLowerCase();
    return {
      original: file.fileName,
      pattern: nameWithoutExt
    };
  });
  
  // Function to check if a text segment contains a file reference
  const processTextForFileReferences = (text: string) => {
    let result = text;
    
    // Check for file references with various formats
    // Look for patterns like: filename.pdf, *filename.pdf*, "filename"
    const fileRefRegex = /(\*[^*]+\*)|("[^"]+")|((?:\w|-)+\.(?:pdf|docx|txt|md))|(\w+-\w+(?:-\w+)*)/g;
    
    result = text.replace(fileRefRegex, (match) => {
      // Clean the match for comparison (remove formatting chars, extensions)
      const cleanMatch = match.replace(/\*|\"|\.pdf|\.docx|\.txt|\.md/g, '').toLowerCase().trim();
      
      // Check if this matches any of our file name patterns
      const matchedFile = fileNamePatterns.find(file => 
        cleanMatch === file.pattern || 
        file.pattern.includes(cleanMatch) || 
        cleanMatch.includes(file.pattern)
      );
      
      if (matchedFile) {
        return `<file>${match}</file>`;
      }
      return match;
    });
    
    return result;
  };
  
  // First handle bold formatting
  const parts = text.split(/(\*\*[^*]+\*\*)/).map(part => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldContent = part.substring(2, part.length - 2);
      // Process the bold content for file references
      return `**${processTextForFileReferences(boldContent)}**`;
    }
    return processTextForFileReferences(part);
  });
  
  // Now process the processed parts for actual rendering
  return parts.map((part, index) => {
    // Handle bold text first
    if (part.startsWith('**') && part.endsWith('**')) {
      const innerContent = part.substring(2, part.length - 2);
      return (
        <strong key={index} className="font-bold">
          {renderContentWithFileHighlights(innerContent)}
        </strong>
      );
    }
    
    // For regular parts
    return renderContentWithFileHighlights(part);
  });
  
  // Helper function to render content with file highlights
  function renderContentWithFileHighlights(content: string) {
    // Split by file markers
    const segments = content.split(/(<file>.*?<\/file>)/g);
    
    return segments.map((segment, idx) => {
      if (segment.startsWith('<file>') && segment.endsWith('</file>')) {
        // Extract the actual text between the markers
        const fileText = segment.substring(6, segment.length - 7);
        return (
          <span 
            key={idx} 
            className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded-sm text-black dark:text-yellow-100 font-medium"
          >
            {fileText}
          </span>
        );
      }
      return <span key={idx}>{segment}</span>;
    });
  }
};