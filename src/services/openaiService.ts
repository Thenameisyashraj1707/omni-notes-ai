import { SummarizationOptions } from "@/components/summarization/SummarizationForm";

// Interface for the OpenAI API request
interface OpenAIRequest {
  model: string;
  messages: {
    role: "system" | "user" | "assistant";
    content: string;
  }[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
}

// Interface for the OpenAI API response
interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Process text content without API key
const processContentLocally = (fileContent: string, options: SummarizationOptions): string => {
  // Get the main paragraphs - split by double newlines
  const paragraphs = fileContent.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  // Determine length based on options
  let maxParagraphs = paragraphs.length;
  if (options.lengthType === "short") {
    maxParagraphs = Math.max(1, Math.floor(paragraphs.length * 0.3));
  } else if (options.lengthType === "medium") {
    maxParagraphs = Math.max(1, Math.floor(paragraphs.length * 0.6));
  } else {
    maxParagraphs = Math.max(1, Math.floor(paragraphs.length * 0.9));
  }
  
  // Take the first paragraph (usually contains the main content) and a selection of others
  const selectedParagraphs = [paragraphs[0]];
  
  // If there are more paragraphs, add some
  if (paragraphs.length > 1) {
    // Add some important paragraphs (assuming paragraphs with keywords might be important)
    const keywords = ["conclusion", "summary", "therefore", "result", "important"];
    const importantIndexes = new Set<number>();
    
    // Find paragraphs with important keywords
    paragraphs.forEach((p, idx) => {
      if (keywords.some(keyword => p.toLowerCase().includes(keyword))) {
        importantIndexes.add(idx);
      }
    });
    
    // Add some evenly distributed paragraphs to reach maxParagraphs
    const step = Math.max(1, Math.floor(paragraphs.length / maxParagraphs));
    for (let i = 0; i < paragraphs.length && selectedParagraphs.length < maxParagraphs; i += step) {
      if (!selectedParagraphs.includes(paragraphs[i])) {
        selectedParagraphs.push(paragraphs[i]);
      }
    }
    
    // Add important paragraphs if not already added
    importantIndexes.forEach(idx => {
      if (!selectedParagraphs.includes(paragraphs[idx]) && selectedParagraphs.length < maxParagraphs) {
        selectedParagraphs.push(paragraphs[idx]);
      }
    });
  }
  
  // Join the selected paragraphs together
  return selectedParagraphs.join('\n\n');
};

export const generateSummaryWithOpenAI = async (
  fileContent: string,
  options: SummarizationOptions
): Promise<string> => {
  // Get OpenAI API key from localStorage
  const apiKey = localStorage.getItem("openai_api_key");
  
  // If no API key, process the content locally
  if (!apiKey || apiKey.trim() === "") {
    console.log("No API key found, processing content locally");
    return processContentLocally(fileContent, options);
  }

  // If API key is available, use OpenAI
  try {
    // Determine max tokens based on length type
    const maxTokens = 
      options.lengthType === "short" ? 200 :
      options.lengthType === "medium" ? 400 : 800;

    // Create a system prompt based on options
    const systemPrompt = createSystemPrompt(options);
    
    // Create user prompt with file content
    const userPrompt = `Please summarize the following content:\n\n${fileContent}`;

    // Create the API request
    const request: OpenAIRequest = {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: maxTokens,
      temperature: 0.5,
      top_p: 1
    };

    // Make API request to OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data: OpenAIResponse = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    // Fall back to local processing if API call fails
    return processContentLocally(fileContent, options);
  }
};

// Process text content to extract keywords without API
const extractKeywordsLocally = (content: string): string[] => {
  const text = content.toLowerCase();
  
  // Common English stopwords to filter out
  const stopwords = new Set([
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "with", 
    "by", "about", "as", "of", "this", "that", "these", "those", "is", "are", 
    "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", 
    "did", "will", "would", "shall", "should", "may", "might", "must", "can", "could"
  ]);
  
  // Extract all words and filter out stopwords and short words
  const words = text.match(/\b\w+\b/g) || [];
  const filteredWords = words.filter(word => !stopwords.has(word) && word.length > 3);
  
  // Count word frequencies
  const wordCounts = new Map<string, number>();
  for (const word of filteredWords) {
    wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
  }
  
  // Look for phrases (2-3 words together)
  const phrases = [];
  for (let i = 0; i < words.length - 1; i++) {
    if (words[i].length > 3 && words[i+1].length > 3) {
      phrases.push(`${words[i]} ${words[i+1]}`);
    }
    if (i < words.length - 2 && words[i].length > 3 && words[i+2].length > 3) {
      phrases.push(`${words[i]} ${words[i+1]} ${words[i+2]}`);
    }
  }
  
  // Count phrase frequencies
  const phraseCounts = new Map<string, number>();
  for (const phrase of phrases) {
    phraseCounts.set(phrase, (phraseCounts.get(phrase) || 0) + 1);
  }
  
  // Combine words and phrases, sort by frequency
  const entries = [...wordCounts.entries(), ...phraseCounts.entries()];
  entries.sort((a, b) => b[1] - a[1]);
  
  // Take top 7 unique keywords/phrases
  const keywords = [];
  const addedWords = new Set();
  
  for (const [term, _] of entries) {
    // Skip if we have component words already
    const termWords = term.split(" ");
    if (termWords.some(w => addedWords.has(w))) {
      continue;
    }
    
    // Add this term and mark its words as added
    keywords.push(term);
    termWords.forEach(w => addedWords.add(w));
    
    if (keywords.length >= 7) {
      break;
    }
  }
  
  // Capitalize first letter of each keyword/phrase
  return keywords.map(k => k.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' '));
};

export const extractKeywordsWithOpenAI = async (content: string): Promise<string[]> => {
  const apiKey = localStorage.getItem("openai_api_key");
  
  // If no API key, extract keywords locally
  if (!apiKey || apiKey.trim() === "") {
    console.log("No API key found, extracting keywords locally");
    return extractKeywordsLocally(content);
  }

  try {
    const request: OpenAIRequest = {
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: "Extract 5-7 important keywords or phrases from the text. Return ONLY a comma-separated list of keywords, nothing else." 
        },
        { role: "user", content }
      ],
      max_tokens: 100,
      temperature: 0.3
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data: OpenAIResponse = await response.json();
    return data.choices[0].message.content.split(",").map(k => k.trim());
  } catch (error) {
    console.error("Error extracting keywords:", error);
    return extractKeywordsLocally(content);
  }
};

// Process text content to detect sentiment without API
const detectSentimentLocally = (content: string): string => {
  const text = content.toLowerCase();
  
  // Define positive and negative word lists
  const positiveWords = [
    "good", "great", "excellent", "wonderful", "amazing", "fantastic", 
    "happy", "joy", "positive", "success", "beneficial", "improvement",
    "advantage", "efficient", "effective", "progress", "benefit", "helpful"
  ];
  
  const negativeWords = [
    "bad", "poor", "terrible", "awful", "horrible", "negative", "sad", 
    "unhappy", "failure", "problem", "issue", "disadvantage", "inefficient", 
    "ineffective", "decline", "harm", "harmful", "difficult"
  ];
  
  // Count occurrences of positive and negative words
  let positiveCount = 0;
  let negativeCount = 0;
  
  for (const word of positiveWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    const matches = text.match(regex);
    if (matches) {
      positiveCount += matches.length;
    }
  }
  
  for (const word of negativeWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    const matches = text.match(regex);
    if (matches) {
      negativeCount += matches.length;
    }
  }
  
  // Determine sentiment based on count
  if (positiveCount > negativeCount * 1.5) {
    return "Positive";
  } else if (negativeCount > positiveCount * 1.5) {
    return "Negative";
  } else {
    return "Neutral";
  }
};

export const detectSentimentWithOpenAI = async (content: string): Promise<string> => {
  const apiKey = localStorage.getItem("openai_api_key");
  
  // If no API key, detect sentiment locally
  if (!apiKey || apiKey.trim() === "") {
    console.log("No API key found, detecting sentiment locally");
    return detectSentimentLocally(content);
  }

  try {
    const request: OpenAIRequest = {
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: "Analyze the sentiment of the text and respond with ONLY one word: Positive, Negative, or Neutral." 
        },
        { role: "user", content }
      ],
      max_tokens: 10,
      temperature: 0.3
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data: OpenAIResponse = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error detecting sentiment:", error);
    return detectSentimentLocally(content);
  }
};

// Process text content to detect topics without API
const detectTopicsLocally = (content: string): string[] => {
  // Simplified topic detection based on keyword frequency
  const keywordsWithCategories = [
    { word: "technology", category: "Technology" },
    { word: "computer", category: "Technology" },
    { word: "software", category: "Technology" },
    { word: "internet", category: "Technology" },
    { word: "data", category: "Technology" },
    { word: "digital", category: "Technology" },
    
    { word: "business", category: "Business" },
    { word: "company", category: "Business" },
    { word: "market", category: "Business" },
    { word: "investment", category: "Business" },
    { word: "finance", category: "Business" },
    
    { word: "health", category: "Health" },
    { word: "medical", category: "Health" },
    { word: "doctor", category: "Health" },
    { word: "patient", category: "Health" },
    { word: "disease", category: "Health" },
    
    { word: "science", category: "Science" },
    { word: "research", category: "Science" },
    { word: "study", category: "Science" },
    { word: "experiment", category: "Science" },
    
    { word: "education", category: "Education" },
    { word: "school", category: "Education" },
    { word: "student", category: "Education" },
    { word: "learning", category: "Education" },
    { word: "teaching", category: "Education" },
    
    { word: "politics", category: "Politics" },
    { word: "government", category: "Politics" },
    { word: "policy", category: "Politics" },
    { word: "election", category: "Politics" },
    
    { word: "environment", category: "Environment" },
    { word: "climate", category: "Environment" },
    { word: "pollution", category: "Environment" },
    { word: "sustainable", category: "Environment" },
    
    { word: "arts", category: "Arts & Culture" },
    { word: "music", category: "Arts & Culture" },
    { word: "film", category: "Arts & Culture" },
    { word: "literature", category: "Arts & Culture" },
    { word: "culture", category: "Arts & Culture" },
  ];
  
  const text = content.toLowerCase();
  const categoryCounts = new Map<string, number>();
  
  // Count occurrences of each category
  for (const entry of keywordsWithCategories) {
    const regex = new RegExp(`\\b${entry.word}\\b`, 'g');
    const matches = text.match(regex);
    
    if (matches) {
      categoryCounts.set(
        entry.category, 
        (categoryCounts.get(entry.category) || 0) + matches.length
      );
    }
  }
  
  // Sort categories by frequency
  const sortedCategories = [...categoryCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);
  
  // Return top categories, or "General" if none found
  return sortedCategories.length > 0 
    ? sortedCategories.slice(0, Math.min(3, sortedCategories.length))
    : ["General"];
};

export const detectTopicsWithOpenAI = async (content: string): Promise<string[]> => {
  const apiKey = localStorage.getItem("openai_api_key");
  
  // If no API key, detect topics locally
  if (!apiKey || apiKey.trim() === "") {
    console.log("No API key found, detecting topics locally");
    return detectTopicsLocally(content);
  }

  try {
    const request: OpenAIRequest = {
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: "Identify 3-5 main topics or themes in the text. Return ONLY a comma-separated list of topics, nothing else." 
        },
        { role: "user", content }
      ],
      max_tokens: 100,
      temperature: 0.3
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data: OpenAIResponse = await response.json();
    return data.choices[0].message.content.split(",").map(t => t.trim());
  } catch (error) {
    console.error("Error detecting topics:", error);
    return detectTopicsLocally(content);
  }
};

// Create chapter summaries without API
const createChapterSummariesLocally = (content: string): { title: string; content: string }[] => {
  // Split content into paragraphs
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  if (paragraphs.length <= 1) {
    return [{ title: "Summary", content: paragraphs[0] || content }];
  }
  
  // Determine how many chapters to create
  const numChapters = paragraphs.length <= 3 ? 2 : 
                       paragraphs.length <= 6 ? 3 : 4;
  
  const chapterSize = Math.ceil(paragraphs.length / numChapters);
  const chapters = [];
  
  // Create chapters with chunks of paragraphs
  for (let i = 0; i < numChapters; i++) {
    const start = i * chapterSize;
    const end = Math.min(start + chapterSize, paragraphs.length);
    
    if (start >= paragraphs.length) break;
    
    // Extract first sentence from first paragraph for title
    const firstPara = paragraphs[start];
    const sentenceMatch = firstPara.match(/^[^.!?]+[.!?]/);
    const titleBase = sentenceMatch ? sentenceMatch[0] : firstPara.substring(0, 30);
    
    // Clean up and truncate title
    let title = titleBase.replace(/[^a-zA-Z0-9\s]/g, '').trim();
    if (title.length > 40) {
      title = title.substring(0, 40) + '...';
    }
    
    // Capitalize title
    title = title.charAt(0).toUpperCase() + title.slice(1);
    
    // Join paragraphs for this chapter
    const chapterContent = paragraphs.slice(start, end).join('\n\n');
    
    chapters.push({
      title: `Chapter ${i+1}: ${title}`,
      content: chapterContent
    });
  }
  
  return chapters;
};

export const createChapterSummariesWithOpenAI = async (content: string): Promise<{ title: string; content: string }[]> => {
  const apiKey = localStorage.getItem("openai_api_key");
  
  // If no API key, create chapter summaries locally
  if (!apiKey || apiKey.trim() === "") {
    console.log("No API key found, creating chapter summaries locally");
    return createChapterSummariesLocally(content);
  }

  try {
    const request: OpenAIRequest = {
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: `Divide the text into 2-4 logical chapters or sections. 
          For each section, provide a title and a summary.
          Format your response as a JSON array with objects containing 'title' and 'content' properties.
          Example: [{"title": "Introduction", "content": "Summary of introduction..."}, {...}]` 
        },
        { role: "user", content }
      ],
      max_tokens: 500,
      temperature: 0.5
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data: OpenAIResponse = await response.json();
    try {
      // Extract JSON from the response
      const content = data.choices[0].message.content;
      const jsonMatch = content.match(/\[.*\]/s);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        return JSON.parse(content);
      }
    } catch (e) {
      console.error("Error parsing JSON from OpenAI response:", e);
      return createChapterSummariesLocally(content);
    }
  } catch (error) {
    console.error("Error creating chapter summaries:", error);
    return createChapterSummariesLocally(content);
  }
};

// Generate bullet points without API
const generateBulletPointsLocally = (content: string): string[] => {
  // Split content into paragraphs
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  // Extract important sentences (first sentence of each paragraph, and sentences with keywords)
  const importantSentences: string[] = [];
  const addedSentences = new Set<string>();
  
  // Keywords that might indicate important sentences
  const keywords = [
    "important", "significant", "key", "main", "primary", "critical", 
    "crucial", "essential", "fundamental", "major", "vital", "conclusion",
    "therefore", "thus", "result", "ultimately", "finally"
  ];
  
  // Process each paragraph
  paragraphs.forEach(paragraph => {
    // Split into sentences (simple split by period, question mark, exclamation mark)
    const sentences = paragraph.split(/[.!?]+/).filter(s => s.trim().length > 0).map(s => s.trim() + '.');
    
    // Add first sentence of each paragraph
    if (sentences.length > 0 && !addedSentences.has(sentences[0])) {
      importantSentences.push(sentences[0]);
      addedSentences.add(sentences[0]);
    }
    
    // Add sentences with keywords
    sentences.forEach(sentence => {
      if (!addedSentences.has(sentence) && 
          keywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
        importantSentences.push(sentence);
        addedSentences.add(sentence);
      }
    });
  });
  
  // If we have too many sentences, trim the list
  const maxBullets = 7;
  if (importantSentences.length > maxBullets) {
    // Keep first bullet plus a selection of others
    const first = importantSentences[0];
    const rest = importantSentences.slice(1);
    // Select evenly distributed bullets from the rest
    const step = Math.ceil(rest.length / (maxBullets - 1));
    const selected = [];
    for (let i = 0; i < rest.length && selected.length < maxBullets - 1; i += step) {
      selected.push(rest[i]);
    }
    return [first, ...selected];
  }
  
  // If we don't have enough, use the paragraphs themselves
  if (importantSentences.length < 3 && paragraphs.length > 2) {
    return paragraphs.slice(0, maxBullets).map(p => {
      // Truncate long paragraphs
      if (p.length > 100) {
        return p.substring(0, 100) + '...';
      }
      return p;
    });
  }
  
  return importantSentences;
};

export const generateBulletPointsWithOpenAI = async (content: string): Promise<string[]> => {
  const apiKey = localStorage.getItem("openai_api_key");
  
  // If no API key, generate bullet points locally
  if (!apiKey || apiKey.trim() === "") {
    console.log("No API key found, generating bullet points locally");
    return generateBulletPointsLocally(content);
  }

  try {
    const request: OpenAIRequest = {
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: `Extract 5-7 key points from the text as bullet points. 
          Return ONLY a JSON array of strings, with each string being a bullet point. 
          Example: ["First key point", "Second key point", ...]` 
        },
        { role: "user", content }
      ],
      max_tokens: 350,
      temperature: 0.3
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data: OpenAIResponse = await response.json();
    try {
      // Extract JSON from the response
      const content = data.choices[0].message.content;
      const jsonMatch = content.match(/\[.*\]/s);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        return JSON.parse(content);
      }
    } catch (e) {
      console.error("Error parsing JSON from OpenAI response:", e);
      return generateBulletPointsLocally(content);
    }
  } catch (error) {
    console.error("Error generating bullet points:", error);
    return generateBulletPointsLocally(content);
  }
};

// Helper function to create system prompt based on options
const createSystemPrompt = (options: SummarizationOptions): string => {
  const lengthInstructions = 
    options.lengthType === "short" ? "Create a very concise summary, focusing only on the most important information." :
    options.lengthType === "medium" ? "Create a balanced summary that covers the main points without too much detail." :
    "Create a comprehensive summary that covers the main points and includes supporting details.";

  const summaryTypeInstructions = 
    options.summaryType === "extractive" ? "Use direct quotes and phrases from the original text." :
    options.summaryType === "abstractive" ? "Rephrase the content in your own words, focusing on the meaning." :
    "Use a mix of direct quotes and rephrasing, as appropriate.";

  const languageInstructions = options.language !== "english" ? 
    `Write the summary in ${options.language}.` : "";

  return `You are an expert summarizer. ${lengthInstructions} ${summaryTypeInstructions} ${languageInstructions}
  Maintain a professional, informative tone and structure the summary in well-organized paragraphs.
  Focus on factual information and key insights.`;
};
