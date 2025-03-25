import { artists } from "../data/artists";

export function findArtistIdByName(artistName: string): string {
  const artist = artists.find((a) => a.name === artistName);
  if (!artist) {
    console.warn(`Artist not found in static data: ${artistName}`);
    // For artists from the database that aren't in the static data,
    // use the artist name as the ID to ensure navigation works
    // This assumes the artist name is unique
    return artistName;
  }
  return artist.id;
}
