import { PillCheckbox } from "./PillCheckbox";

interface MyContentProps {
  allCars: string[];
  allTracks: string[];
  ownedCars: Set<string>;
  ownedTracks: Set<string>;
  freeCars: Set<string>;
  freeTracks: Set<string>;
  toggleCar: (car: string) => void;
  toggleTrack: (track: string) => void;
}

export function MyContent({
  allCars,
  allTracks,
  ownedCars,
  ownedTracks,
  freeCars,
  freeTracks,
  toggleCar,
  toggleTrack,
}: MyContentProps) {
  const ownedCarsCount = ownedCars.size;
  const ownedTracksCount = ownedTracks.size;

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Cars Section - Left Column */}
      <div className="w-full">
        <h2 className="text-xl font-semibold text-gray-100 mb-2">
          Cars ({ownedCarsCount}/{allCars.length} owned)
        </h2>
        <p className="text-xs text-gray-400 mb-3">
          <span className="text-green-400">★</span> = Free content (cannot be
          deselected)
        </p>
        <div className="flex flex-wrap gap-2">
          {allCars.map((car) => (
            <PillCheckbox
              key={car}
              label={car}
              checked={ownedCars.has(car)}
              onChange={() => toggleCar(car)}
              disabled={freeCars.has(car)}
              isFree={freeCars.has(car)}
            />
          ))}
        </div>
      </div>

      {/* Tracks Section - Right Column */}
      <div className="w-full">
        <h2 className="text-xl font-semibold text-gray-100 mb-2">
          Tracks ({ownedTracksCount}/{allTracks.length} owned)
        </h2>
        <p className="text-xs text-gray-400 mb-3">
          <span className="text-green-400">★</span> = Free content (cannot be
          deselected)
        </p>
        <div className="flex flex-wrap gap-2">
          {allTracks.map((track) => (
            <PillCheckbox
              key={track}
              label={track}
              checked={ownedTracks.has(track)}
              onChange={() => toggleTrack(track)}
              disabled={freeTracks.has(track)}
              isFree={freeTracks.has(track)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
