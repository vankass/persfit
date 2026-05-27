const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const BASE_URL = "https://www.googleapis.com/youtube/v3";

export interface YouTubeVideo {
  id: { videoId: string };
  snippet: {
    title: string;
    thumbnails: {
      medium: { url: string };
      default: { url: string };
    };
    channelTitle: string;
  };
}

export async function searchExerciseVideo(
  exerciseId: string
): Promise<YouTubeVideo[]> {
  if (!API_KEY) {
    return [];
  }

  const searchTerm = exerciseId
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\d+/g, "");

  const query = `${searchTerm} техника выполнения`;

  const params = new URLSearchParams({
    part: "snippet",
    q: query,
    type: "video",
    maxResults: "4",
    relevanceLanguage: "ru",
    key: API_KEY,
  });

  const response = await fetch(`${BASE_URL}/search?${params}`);

  if (!response.ok) {
    const error = await response.json();
    console.error("YouTube API error:", error);
    throw new Error(error.error?.message || "Failed to load videos");
  }

  const data = await response.json();
  return data.items || [];
}