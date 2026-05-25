/** Opens YouTube search for a how-to demo of the given exercise. */
export function getExerciseYoutubeUrl(exerciseName: string): string {
  const name = exerciseName.trim() || "exercise";
  const query = `how to do ${name} correct form`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}
