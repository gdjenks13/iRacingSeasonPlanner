import { useMemo, useState } from "react";
import type { Series, LicenseClass, Discipline } from "../types";
import classesData from "../data/classes.json";

const classColors: Record<LicenseClass, string> = {
  Unranked: "bg-gray-800",
  Rookie: "bg-red-900",
  "Class D": "bg-orange-900",
  "Class C": "bg-yellow-900",
  "Class B": "bg-green-900",
  "Class A": "bg-blue-900",
};

// Helper to find car class from cars listed in track string
function findCarClassFromTrack(trackString: string): string | null {
  for (const carClass of classesData) {
    const hasMatchingCar = carClass.Cars.some((car) =>
      trackString.includes(car)
    );
    if (hasMatchingCar) {
      return carClass["Car Class"];
    }
  }
  return null;
}

// Helper to get cars from track string (for special series)
function getCarsFromTrackString(trackString: string): string[] {
  const cars: string[] = [];
  for (const carClass of classesData) {
    for (const car of carClass.Cars) {
      if (trackString.includes(car)) {
        cars.push(car);
      }
    }
  }
  return cars;
}

// Helper to check if user owns at least one car from a list
function ownsAnyCar(cars: string[], ownedCars: Set<string>): boolean {
  return cars.some((car) => ownedCars.has(car));
}

// Check if this is a special series
function isSpecialSeries(seriesName: string): boolean {
  return (
    seriesName === "Draft Master Challenge by Simagic" ||
    seriesName === "Ring Meister"
  );
}

// Get display name for special series week
function getSpecialSeriesWeekDisplay(
  seriesName: string,
  trackString: string
): string {
  const carClass = findCarClassFromTrack(trackString);
  if (seriesName === "Draft Master Challenge by Simagic") {
    const firstWord = trackString.split(" ")[0];
    return carClass ? `${firstWord} - ${carClass}` : trackString;
  } else if (seriesName === "Ring Meister") {
    return carClass ? `Nurburgring - ${carClass}` : trackString;
  }
  return trackString;
}

interface RecommendedSeriesProps {
  series: Series[];
  ownedTracks: Set<string>;
  ownedCars: Set<string>;
  getBaseTrackName: (track: string) => string;
  selectedDisciplines: Set<Discipline>;
  selectedClasses: Set<LicenseClass>;
}

export function RecommendedSeries({
  series,
  ownedTracks,
  ownedCars,
  getBaseTrackName,
  selectedDisciplines,
  selectedClasses,
}: RecommendedSeriesProps) {
  const [onlyOwnedCars, setOnlyOwnedCars] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

  const toggleCardExpanded = (idx: number) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  const rankedSeries = useMemo(() => {
    // Filter by discipline and class
    const filtered = series.filter(
      (s) =>
        selectedDisciplines.has(s.Discipline as Discipline) &&
        selectedClasses.has(s.Class as LicenseClass)
    );

    // Calculate owned tracks count for each series
    const withOwnership = filtered.map((s) => {
      const isSpecial = isSpecialSeries(s.Series);

      if (isSpecial) {
        // For special series, each week is a unique track+car combo
        const weekCombos = s.Tracks.map((t) => {
          const baseName = getBaseTrackName(t.track);
          const carClass = findCarClassFromTrack(t.track);
          const carsForWeek = getCarsFromTrackString(t.track);
          const ownsTrack = ownedTracks.has(baseName);
          const ownsCarsForWeek = ownsAnyCar(carsForWeek, ownedCars);
          const isOwned = ownsTrack && ownsCarsForWeek;
          const displayName = getSpecialSeriesWeekDisplay(s.Series, t.track);

          return {
            week: t.week,
            displayName,
            baseName,
            carClass,
            carsForWeek,
            ownsTrack,
            ownsCarsForWeek,
            isOwned,
          };
        });

        const ownedCount = weekCombos.filter((w) => w.isOwned).length;
        const totalWeeks = weekCombos.length;

        // For special series, check if user owns ANY car that appears in this series
        const allCarsInSeries = new Set<string>();
        s.Tracks.forEach((t) => {
          getCarsFromTrackString(t.track).forEach((car) =>
            allCarsInSeries.add(car)
          );
        });
        const ownsCar = Array.from(allCarsInSeries).some((car) =>
          ownedCars.has(car)
        );

        const ownedCombos = weekCombos.filter((w) => w.isOwned);
        const notOwnedCombos = weekCombos.filter((w) => !w.isOwned);

        return {
          series: s,
          ownedCount,
          totalTracks: totalWeeks,
          percentage: totalWeeks > 0 ? (ownedCount / totalWeeks) * 100 : 0,
          ownsCar,
          ownedTracksList: ownedCombos.map((w) => w.displayName),
          notOwnedTracksList: notOwnedCombos.map((w) => w.displayName),
          isSpecialSeries: true,
          weekCombos,
        };
      } else {
        // Regular series - original logic
        const uniqueBaseTracks = new Set(
          s.Tracks.map((t) => getBaseTrackName(t.track))
        );
        const ownedCount = Array.from(uniqueBaseTracks).filter((track) =>
          ownedTracks.has(track)
        ).length;
        const totalTracks = uniqueBaseTracks.size;

        // Check if user owns any of the cars for this series
        const ownsCar = s.Cars.some((car) => ownedCars.has(car));

        // Separate tracks into owned and not owned
        const uniqueTracksList = Array.from(uniqueBaseTracks);
        const ownedTracksList = uniqueTracksList.filter((track) =>
          ownedTracks.has(track)
        );
        const notOwnedTracksList = uniqueTracksList.filter(
          (track) => !ownedTracks.has(track)
        );

        return {
          series: s,
          ownedCount,
          totalTracks,
          percentage: totalTracks > 0 ? (ownedCount / totalTracks) * 100 : 0,
          ownsCar,
          ownedTracksList,
          notOwnedTracksList,
          isSpecialSeries: false,
          weekCombos: null,
        };
      }
    });

    // Filter by car ownership if enabled
    const finalFiltered = onlyOwnedCars
      ? withOwnership.filter((s) => s.ownsCar)
      : withOwnership;

    // Sort by owned count descending, then by percentage
    return finalFiltered.sort((a, b) => {
      if (b.ownedCount !== a.ownedCount) {
        return b.ownedCount - a.ownedCount;
      }
      return b.percentage - a.percentage;
    });
  }, [
    series,
    selectedDisciplines,
    selectedClasses,
    ownedTracks,
    ownedCars,
    getBaseTrackName,
    onlyOwnedCars,
  ]);

  return (
    <div>
      <div className="mb-4 text-center">
        <p className="text-xs sm:text-sm text-gray-400">
          Series ranked by track ownership. Tap a card to see track details.
        </p>
      </div>

      {/* Car Filter Toggle */}
      <div className="mb-4 flex justify-center">
        <button
          onClick={() => setOnlyOwnedCars(!onlyOwnedCars)}
          className={`px-3 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer active:scale-95 flex items-center gap-2 ${
            onlyOwnedCars
              ? "bg-green-700 border-green-600 text-white"
              : "bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700 active:bg-gray-600"
          }`}
        >
          <span
            className={`w-4 h-4 rounded flex items-center justify-center text-xs ${
              onlyOwnedCars ? "bg-green-500" : "bg-gray-600"
            }`}
          >
            {onlyOwnedCars ? "✓" : ""}
          </span>
          Only show series I own a car for
        </button>
      </div>

      {/* Series Grid - Each card is independent */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-start">
        {rankedSeries.map(
          (
            {
              series: s,
              ownedCount,
              totalTracks,
              percentage,
              ownsCar,
              ownedTracksList,
              notOwnedTracksList,
              isSpecialSeries: isSpecial,
              weekCombos,
            },
            idx
          ) => {
            const headerColor =
              classColors[s.Class as LicenseClass] || "bg-gray-700";
            const isExpanded = expandedCards.has(idx);

            return (
              <div
                key={idx}
                onClick={() => toggleCardExpanded(idx)}
                className={`${headerColor} rounded-lg p-3 border border-gray-600 cursor-pointer transition-all hover:brightness-110 active:scale-[0.98]`}
              >
                {/* Header Section */}
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm leading-tight line-clamp-2">
                      {s.Series}
                    </h3>
                    <p className="text-xs text-gray-300 mt-1">
                      {s.Discipline} • {s.Class}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div
                      className={`text-lg font-bold ${
                        percentage === 100
                          ? "text-green-400"
                          : percentage >= 75
                          ? "text-blue-400"
                          : percentage >= 50
                          ? "text-yellow-400"
                          : "text-gray-400"
                      }`}
                    >
                      {ownedCount}/{totalTracks}
                    </div>
                    <div className="text-xs text-gray-400">
                      {percentage.toFixed(0)}%
                    </div>
                  </div>
                </div>

                {/* Car ownership badge */}
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      ownsCar
                        ? "bg-green-900/50 text-green-400"
                        : "bg-yellow-900/50 text-yellow-400"
                    }`}
                  >
                    {ownsCar ? "✓ Own car" : "✗ Need car"}
                  </span>
                  {isSpecial && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-900/50 text-purple-400">
                      Multi-class
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    {isExpanded ? "▲ Collapse" : "▼ Expand"}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-2">
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        percentage === 100
                          ? "bg-green-500"
                          : percentage >= 75
                          ? "bg-blue-500"
                          : percentage >= 50
                          ? "bg-yellow-500"
                          : "bg-gray-500"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                {/* Expandable: Cars List - only for regular series */}
                {isExpanded && !isSpecial && (
                  <div className="mt-3 pt-3 border-t border-gray-600/50">
                    <div className="text-xs text-gray-400 mb-1.5">Cars:</div>
                    <div className="flex flex-wrap gap-1">
                      {s.Cars.map((car, i) => (
                        <span
                          key={i}
                          className={`inline-block px-2 py-0.5 rounded text-xs ${
                            ownedCars.has(car)
                              ? "bg-green-900/40 text-green-400"
                              : "bg-gray-700/50 text-gray-400"
                          }`}
                        >
                          {car}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Expandable: Special Series - Week by week breakdown */}
                {isExpanded && isSpecial && weekCombos && (
                  <div className="mt-3 pt-3 border-t border-gray-600/50">
                    <div className="text-xs text-gray-400 mb-2">
                      Weekly Track & Car Combos:
                    </div>
                    <div className="flex gap-3 text-xs">
                      {/* Owned column */}
                      <div className="flex-1 min-w-0">
                        <div className="text-green-400 font-semibold mb-1.5 flex items-center gap-1">
                          <span>✓</span> Can Race (
                          {weekCombos.filter((w) => w.isOwned).length})
                        </div>
                        <div className="text-gray-300 space-y-1.5">
                          {weekCombos.filter((w) => w.isOwned).length > 0 ? (
                            weekCombos
                              .filter((w) => w.isOwned)
                              .map((w, i) => (
                                <div
                                  key={i}
                                  className="wrap-break-word text-green-300"
                                >
                                  W{w.week}: {w.displayName}
                                </div>
                              ))
                          ) : (
                            <div className="text-gray-500 italic">None</div>
                          )}
                        </div>
                      </div>
                      {/* Need column */}
                      <div className="flex-1 min-w-0">
                        <div className="text-yellow-400 font-semibold mb-1.5 flex items-center gap-1">
                          <span>✗</span> Need (
                          {weekCombos.filter((w) => !w.isOwned).length})
                        </div>
                        <div className="text-gray-300 space-y-1.5">
                          {weekCombos.filter((w) => !w.isOwned).length > 0 ? (
                            weekCombos
                              .filter((w) => !w.isOwned)
                              .map((w, i) => (
                                <div key={i} className="wrap-break-word">
                                  <span className="text-gray-400">
                                    W{w.week}:
                                  </span>{" "}
                                  <span
                                    className={
                                      w.ownsTrack
                                        ? "text-green-400"
                                        : "text-yellow-400"
                                    }
                                  >
                                    {w.baseName}
                                  </span>
                                  {" + "}
                                  <span
                                    className={
                                      w.ownsCarsForWeek
                                        ? "text-green-400"
                                        : "text-yellow-400"
                                    }
                                  >
                                    {w.carClass}
                                  </span>
                                </div>
                              ))
                          ) : (
                            <div className="text-gray-500 italic">None</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Expandable: Tracks List - Adaptive columns (regular series only) */}
                {isExpanded && !isSpecial && (
                  <div className="mt-3 flex gap-3 text-xs">
                    {/* Owned column */}
                    <div className="flex-1 min-w-0">
                      <div className="text-green-400 font-semibold mb-1.5 flex items-center gap-1">
                        <span>✓</span> Owned ({ownedTracksList.length})
                      </div>
                      <div className="text-gray-300 space-y-1">
                        {ownedTracksList.length > 0 ? (
                          ownedTracksList.map((track, i) => (
                            <div
                              key={i}
                              className="wrap-break-word"
                              title={track}
                            >
                              {track}
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-500 italic">None</div>
                        )}
                      </div>
                    </div>
                    {/* Need column */}
                    <div className="flex-1 min-w-0">
                      <div className="text-yellow-400 font-semibold mb-1.5 flex items-center gap-1">
                        <span>✗</span> Need ({notOwnedTracksList.length})
                      </div>
                      <div className="text-gray-300 space-y-1">
                        {notOwnedTracksList.length > 0 ? (
                          notOwnedTracksList.map((track, i) => (
                            <div
                              key={i}
                              className="wrap-break-word"
                              title={track}
                            >
                              {track}
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-500 italic">None</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          }
        )}
      </div>

      {rankedSeries.length === 0 && (
        <p className="text-center text-gray-500 mt-8 px-4">
          No series match the current filters.
          {onlyOwnedCars && (
            <span className="block mt-2 text-sm">
              Try disabling "Only show series I own a car for"
            </span>
          )}
        </p>
      )}
    </div>
  );
}
