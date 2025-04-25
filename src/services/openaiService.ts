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

const DEMO_SUMMARIES = {
  document: `This document discusses the impact of artificial intelligence on modern society,
covering economic benefits, ethical concerns, and future challenges.
It highlights how AI is transforming industries through automation while raising questions
about job displacement and privacy. The conclusion emphasizes the need for balanced
regulation that encourages innovation while protecting public interests.`,
  
  audio: `In this audio recording, the speaker presents research findings on climate change
mitigation strategies. They discuss renewable energy adoption rates across different
countries and analyze policy effectiveness. The presentation concludes with
recommendations for accelerating the transition to sustainable energy systems through
improved international cooperation and targeted economic incentives.`,
  
  video: `This video explains quantum computing fundamentals, comparing classical and quantum
approaches. The presenter uses animations to demonstrate quantum bits (qubits) and core
concepts like superposition and entanglement. They showcase recent breakthroughs in 
quantum computing research and discuss potential applications in cryptography, 
drug discovery, and optimization problems that could revolutionize various industries.`
};

const DEMO_KEYWORDS = [
  "Artificial Intelligence", "Machine Learning", "Innovation", 
  "Ethics", "Technology", "Automation", "Digital Transformation"
];

const isDemoMode = () => {
  const apiKey = localStorage.getItem("openai_api_key");
  return !apiKey || apiKey.trim() === "";
};

export const generateSummaryWithOpenAI = async (
  fileContent: string,
  options: SummarizationOptions
): Promise<string> => {
  // If in demo mode, return a sample summary based on source type
  if (isDemoMode()) {
    console.log("Using demo mode for summary generation");
    const sourceType = options.sourceType || "document";
    return DEMO_SUMMARIES[sourceType as keyof typeof DEMO_SUMMARIES] || DEMO_SUMMARIES.document;
  }

  // Get OpenAI API key from localStorage
  const apiKey = localStorage.getItem("openai_api_key");
  
  if (!apiKey) {
    throw new Error("OpenAI API key is required. Please set it in the settings.");
  }

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

  try {
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
    throw error;
  }
};

export const extractKeywordsWithOpenAI = async (content: string): Promise<string[]> => {
  // If in demo mode, return sample keywords
  if (isDemoMode()) {
    console.log("Using demo mode for keyword extraction");
    return DEMO_KEYWORDS;
  }

  const apiKey = localStorage.getItem("openai_api_key");
  
  if (!apiKey) {
    throw new Error("OpenAI API key is required");
  }

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

  try {
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
    throw error;
  }
};

export const detectSentimentWithOpenAI = async (content: string): Promise<string> => {
  const apiKey = localStorage.getItem("openai_api_key");
  
  if (!apiKey) {
    throw new Error("OpenAI API key is required");
  }

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

  try {
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
    throw error;
  }
};

export const detectTopicsWithOpenAI = async (content: string): Promise<string[]> => {
  const apiKey = localStorage.getItem("openai_api_key");
  
  if (!apiKey) {
    throw new Error("OpenAI API key is required");
  }

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

  try {
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
    throw error;
  }
};

export const createChapterSummariesWithOpenAI = async (content: string): Promise<{ title: string; content: string }[]> => {
  const apiKey = localStorage.getItem("openai_api_key");
  
  if (!apiKey) {
    throw new Error("OpenAI API key is required");
  }

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

  try {
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
      return [
        { title: "Error Parsing Chapters", content: "The AI response couldn't be parsed into chapters correctly." }
      ];
    }
  } catch (error) {
    console.error("Error creating chapter summaries:", error);
    throw error;
  }
};

export const generateBulletPointsWithOpenAI = async (content: string): Promise<string[]> => {
  // If in demo mode, return sample bullet points
  if (isDemoMode()) {
    console.log("Using demo mode for bullet points generation");
    return [
      "AI technologies are transforming industries through increased automation",
      "Ethical concerns include potential job displacement and privacy issues",
      "Economic benefits include increased productivity and new job creation",
      "Regulatory frameworks need to balance innovation with public protection",
      "Future challenges include ensuring equitable access to AI technologies"
    ];
  }

  const apiKey = localStorage.getItem("openai_api_key");
  
  if (!apiKey) {
    throw new Error("OpenAI API key is required");
  }

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

  try {
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
      return ["Error parsing bullet points from AI response"];
    }
  } catch (error) {
    console.error("Error generating bullet points:", error);
    throw error;
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
