
import { GoogleGenAI } from "@google/genai";

export async function editImage(base64Image: string, prompt: string, seed?: number): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  
  // Extract base64 data and mime type
  const mimeType = base64Image.match(/data:([^;]+);base64,/)?.[1] || 'image/png';
  const data = base64Image.split(',')[1];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: data,
              mimeType: mimeType,
            },
          },
          {
            text: `Analyze this image. Perform a realistic face swap or face modification based on this request: "${prompt}". Maintain the exact lighting, the large red furry hat, the white tank top with text, the black jeans, and the overall industrial/backstage environment. The new face should look perfectly integrated and realistic.`,
          },
        ],
      },
      config: {
        seed: seed,
      },
    });

    if (!response.candidates?.[0]?.content?.parts) {
      throw new Error("No response from AI");
    }

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image data found in the response");
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate image edit.");
  }
}
