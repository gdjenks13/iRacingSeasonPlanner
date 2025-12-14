import { useMemo, useState } from "react";
import type { Series, LicenseClass, Discipline } from "../types";

const classColors: Record<LicenseClass, string> = {
  Unranked: "bg-black-900",
  Rookie: "bg-red-900",
  "Class D": "bg-orange-900",
  "Class C": "bg-yellow-900",
  "Class B": "bg-green-900",
  "Class A": "bg-blue-900",
};

const disciplines: Discipline[] = [
  "Oval",
  "Dirt Oval",
  "Dirt Road",
  "Sports Car",
  "Formula Car",
];

const classes: LicenseClass[] = [
  "Unranked",
  "Rookie",
  "Class D",
  "Class C",
  "Class B",
  "Class A",
];

interface RecommendedSeriesProps {
  series: Series[];
  ownedTracks: Set<string>;
  ownedCars: Set<string>;
  getBaseTrackName: (track: string) => string;
}

export function RecommendedSeries({
  series,
  ownedTracks,
  ownedCars,
  getBaseTrackName,
}: RecommendedSeriesProps) {
  const [selectedDisciplines, setSelectedDisciplines] = useState<
    Set<Discipline>
  >(new Set(disciplines));
  const [selectedClasses, setSelectedClasses] = useState<Set<LicenseClass>>(
    new Set(classes)
  );

  const toggleDiscipline = (discipline: Discipline) => {
    setSelectedDisciplines((prev) => {
      const next = new Set(prev);
      if (next.has(discipline)) {
        next.delete(discipline);
      } else {
        next.add(discipline);
      }
      return next;
    });
  };

  const toggleClass = (cls: LicenseClass) => {
    setSelectedClasses((prev) => {
      const next = new Set(prev);
      if (next.has(cls)) {
        next.delete(cls);
      } else {
        next.add(cls);
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
      const uniqueBaseTracks = new Set(
        s.Tracks.map((t) => getBaseTrackName(t.track))
      );
      const ownedCount = Array.from(uniqueBaseTracks).filter((track) =>
        ownedTracks.has(track)
      ).length;
      const totalTracks = uniqueBaseTracks.size;

      // Check if user owns any of the cars for this series
      const ownsCar = s.Cars.some((car) => ownedCars.has(car));

      return {
        series: s,
        ownedCount,
        totalTracks,
        percentage: totalTracks > 0 ? (ownedCount / totalTracks) * 100 : 0,
        ownsCar,
      };
    });

    // Sort by owned count descending, then by percentage
    return withOwnership.sort((a, b) => {
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
  ]);

  return (
    <div>
      <div className="mb-4 text-center">
        <p className="text-sm text-gray-400">
          Series are ranked by how many tracks you own. Car ownership is shown
          but not factored into ranking.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-4 justify-center">
        {/* Discipline Filter */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-400">
            Discipline
          </span>
          <div className="flex flex-wrap gap-1">
            {disciplines.map((d) => (
              <button
                key={d}
                onClick={() => toggleDiscipline(d)}
                className={`px-2 py-0.5 text-xs rounded border border-gray-600 transition-colors cursor-pointer ${
                  selectedDisciplines.has(d)
                    ? "bg-blue-800 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Class Filter */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-400">Class</span>
          <div className="flex flex-wrap gap-1">
            {classes.map((c) => (
              <button
                key={c}
                onClick={() => toggleClass(c)}
                className={`px-2 py-0.5 text-xs rounded border border-gray-600 transition-colors cursor-pointer ${
                  selectedClasses.has(c)
                    ? "bg-blue-800 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Series List */}
      <div className="grid grid-cols-3 gap-3">
        {rankedSeries.map(
          (
            { series: s, ownedCount, totalTracks, percentage, ownsCar },
            idx
          ) => {
            const headerColor =
              classColors[s.Class as LicenseClass] || "bg-gray-700";

            return (
              <div
                key={idx}
                className={`${headerColor} rounded-lg p-3 border border-gray-600 flex flex-col h-full min-h-35 cursor-pointer transition-all hover:brightness-110`}
              >
                <div className="flex justify-between items-start flex-1">
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className="font-semibold text-white text-sm leading-tight line-clamp-2">
                      {s.Series}
                    </h3>
                    <p className="text-xs text-gray-300 mt-1">
                      {s.Discipline} • {s.Class}
                    </p>
                    <p
                      className="text-xs text-gray-400 mt-1 truncate"
                      title={s.Cars.join(", ")}
                    >
                      {s.Cars.join(", ")}
                    </p>
                    <p className="text-xs mt-0.5">
                      {ownsCar ? (
                        <span className="text-green-400">✓ Own car</span>
                      ) : (
                        <span className="text-yellow-400">✗ Need car</span>
                      )}
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

                {/* Progress bar */}
                <div className="mt-auto pt-2">
                  <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
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
              </div>
            );
          }
        )}
      </div>

      {rankedSeries.length === 0 && (
        <p className="text-center text-gray-500 mt-8">
          No series match the current filters.
        </p>
      )}
    </div>
  );
}
