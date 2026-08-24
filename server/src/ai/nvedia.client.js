import OpenAI from "openai";
import { env } from "../config/env.config.js";

const nvidia = new OpenAI({
  baseURL: env.NVIDIA_BASE_URL,
  apiKey: env.NVIDIA_API_KEY,
});

export const callNvidia = async ({
  system,
  prompt,
}) => {
  if (!env.NVIDIA_API_KEY) {
    throw new Error(
      "NVIDIA_API_KEY is not configured"
    );
  }

  const response =
    await nvidia.chat.completions.create({
      model: env.NVIDIA_MODEL,

      messages: [
        {
          role: "system",
          content: system,
        },
        {
          role: "user",
          content: prompt,
        },
      ],

      temperature: 0,

      max_tokens: 2048,

      reasoning_budget: 512,

      stream: false,
    });

  const content =
    response.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error(
      "NVIDIA returned an empty response"
    );
  }

  console.log(
    "NVIDIA response:",
    content
  );

  return content;
};