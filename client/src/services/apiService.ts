import { apiRequest } from "@/lib/queryClient";
import { Guide } from "@shared/schema";

interface GenerateGuideResponse {
  guide: Guide;
}

interface GetGuideResponse {
  guide: Guide;
}

interface GetRecentGuidesResponse {
  guides: Guide[];
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

export const getRecentGuides = async (limit: number = 5): Promise<Guide[]> => {
  const response = await apiRequest("GET", `/api/guides/recent/list?limit=${limit}`, undefined);
  const data = await response.json() as GetRecentGuidesResponse;
  return data.guides;
};
