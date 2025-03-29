import { apiRequest } from "@/lib/queryClient";
import { Guide } from "@shared/schema";

interface GenerateGuideResponse {
  guide: Guide;
}

interface GetGuideResponse {
  guide: Guide;
}

export const generateGuide = async (query: string): Promise<Guide> => {
  const response = await apiRequest("POST", "/api/guides/generate", { query });
  const data = await response.json() as GenerateGuideResponse;
  return data.guide;
};

export const getGuideBySlug = async (slug: string): Promise<Guide> => {
  const response = await apiRequest("GET", `/api/guides/${slug}`, undefined);
  const data = await response.json() as GetGuideResponse;
  return data.guide;
};
