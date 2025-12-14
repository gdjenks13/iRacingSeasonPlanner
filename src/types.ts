export interface Track {
  week: number;
  track: string;
}

export interface Series {
  Series: string;
  Cars: string[];
  Class: string;
  Discipline: string;
  Tracks: Track[];
}

export type LicenseClass =
  | "Unranked"
  | "Rookie"
  | "Class D"
  | "Class C"
  | "Class B"
  | "Class A";
export type Discipline =
  | "Oval"
  | "Dirt Oval"
  | "Dirt Road"
  | "Sports Car"
  | "Formula Car";
