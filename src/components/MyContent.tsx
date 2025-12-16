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
    <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
      {/* Cars Section */}
      <div className="w-full">
        <div className="sticky top-0 bg-[#1a1a2e] pb-2 z-10">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-100 mb-1">
            Cars ({ownedCarsCount}/{allCars.length} owned)
          </h2>
          <p className="text-xs text-gray-400 mb-2">
            <span className="text-green-400">★</span> = Free content (cannot be
            deselected)
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
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

      {/* Tracks Section */}
      <div className="w-full">
        <div className="sticky top-0 bg-[#1a1a2e] pb-2 z-10">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-100 mb-1">
            Tracks ({ownedTracksCount}/{allTracks.length} owned)
          </h2>
          <p className="text-xs text-gray-400 mb-2">
            <span className="text-green-400">★</span> = Free content (cannot be
            deselected)
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
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
