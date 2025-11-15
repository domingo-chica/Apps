import { GoogleGenAI, Modality } from "@google/genai";

export const generateSpeech = async (text: string, voice: string): Promise<string | null> => {
    if (!process.env.API_KEY) {
      throw new Error("API key not found. Please ensure it is configured in your environment.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // This prompt helps guide the AI to use a more engaging tone suitable for a children's story.
    const prompt = `Narrate the following story in a cheerful and friendly voice for children: ${text}`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: voice },
                },
            },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("No audio data was returned from the API.");
    }
    
    return base64Audio;
};
