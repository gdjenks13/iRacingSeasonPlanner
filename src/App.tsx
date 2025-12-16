import { useState, useMemo } from "react";
import scheduleData from "./data/schedule.json";
import type { Series, LicenseClass, Discipline } from "./types";
import { useOwnedContent } from "./hooks/useOwnedContent";
import { MyContent } from "./components/MyContent";
import { RecommendedSeries } from "./components/RecommendedSeries";

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

type Tab = "schedule" | "myContent" | "recommended";

// Helper to extract base track name (before hyphen)
function getBaseTrackName(trackName: string): string {
  const hyphenIndex = trackName.indexOf(" - ");
  if (hyphenIndex > 0) {
    return trackName.substring(0, hyphenIndex).trim();
  }
  return trackName.trim();
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("schedule");
  const [selectedDisciplines, setSelectedDisciplines] = useState<
    Set<Discipline>
  >(new Set(disciplines));
  const [selectedClasses, setSelectedClasses] = useState<Set<LicenseClass>>(
    new Set(classes)
  );

  // Extract all unique cars and tracks
  const { allCars, allTracks, freeCars, freeTracks } = useMemo(() => {
    const carsSet = new Set<string>();
    const tracksSet = new Set<string>();
    const freeCarSet = new Set<string>();
    const freeTrackSet = new Set<string>();

    (scheduleData as Series[]).forEach((series) => {
      const isRookie = series.Class === "Rookie";

      // Add cars
      series.Cars.forEach((car) => {
        carsSet.add(car);
        if (isRookie) {
          freeCarSet.add(car);
        }
      });

      // Add tracks (base name only)
      series.Tracks.forEach((track) => {
        const baseName = getBaseTrackName(track.track);
        tracksSet.add(baseName);
        if (isRookie) {
          freeTrackSet.add(baseName);
        }
      });
    });

    return {
      allCars: Array.from(carsSet).sort(),
      allTracks: Array.from(tracksSet).sort(),
      freeCars: freeCarSet,
      freeTracks: freeTrackSet,
    };
  }, []);

  const { ownedCars, ownedTracks, toggleCar, toggleTrack, isLoaded } =
    useOwnedContent(freeCars, freeTracks);

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

  const filteredSeries = useMemo(() => {
    return (scheduleData as Series[]).filter(
      (series) =>
        selectedDisciplines.has(series.Discipline as Discipline) &&
        selectedClasses.has(series.Class as LicenseClass)
    );
  }, [selectedDisciplines, selectedClasses]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh p-3 sm:p-4 max-w-10/12 mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold text-center mb-3 sm:mb-4 text-gray-100">
        iRacing Season Planner
      </h1>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-4 sm:mb-6">
        <div className="flex bg-gray-800 rounded-lg p-1 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("schedule")}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === "schedule"
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white active:bg-gray-700"
            }`}
          >
            Schedule
          </button>
          <button
            onClick={() => setActiveTab("myContent")}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === "myContent"
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white active:bg-gray-700"
            }`}
          >
            My Content
          </button>
          <button
            onClick={() => setActiveTab("recommended")}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === "recommended"
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white active:bg-gray-700"
            }`}
          >
            Recommended
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "schedule" && (
        <>
          {/* Filters */}
          <div className="mb-4 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 sm:justify-center">
            {/* Discipline Filter */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-400">
                Discipline
              </span>
              <div className="flex flex-wrap gap-1.5">
                {disciplines.map((d) => (
                  <button
                    key={d}
                    onClick={() => toggleDiscipline(d)}
                    className={`px-3 py-1.5 text-xs rounded border border-gray-600 transition-colors cursor-pointer active:scale-95 ${
                      selectedDisciplines.has(d)
                        ? "bg-blue-800 text-white"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700 active:bg-gray-600"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Class Filter */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-400">Class</span>
              <div className="flex flex-wrap gap-1.5">
                {classes.map((c) => (
                  <button
                    key={c}
                    onClick={() => toggleClass(c)}
                    className={`px-3 py-1.5 text-xs rounded border border-gray-600 transition-colors cursor-pointer active:scale-95 ${
                      selectedClasses.has(c)
                        ? "bg-blue-800 text-white"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700 active:bg-gray-600"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Schedule - Each series as card on mobile, table on desktop */}
          <div className="space-y-3">
            {filteredSeries.map((series, idx) => {
              const headerColor =
                classColors[series.Class as LicenseClass] || "bg-gray-700";
              const carsTooltip = series.Cars.join(", ");

              // Calculate max weeks for this specific series
              const seriesMaxWeeks = Math.max(
                ...series.Tracks.map((t) => t.week),
                0
              );

              return (
                <div
                  key={idx}
                  className="rounded-lg overflow-hidden border border-gray-700"
                >
                  {/* Series Header */}
                  <div className={`${headerColor} p-2`}>
                    <div
                      className="font-semibold text-white text-sm"
                      title={carsTooltip}
                    >
                      {series.Series}
                    </div>
                    <div className="text-xs text-gray-300">
                      {series.Discipline} • {series.Class}
                    </div>
                  </div>

                  {/* Mobile: Vertical list */}
                  <div className="sm:hidden bg-gray-900 divide-y divide-gray-700">
                    {Array.from({ length: seriesMaxWeeks }, (_, i) => {
                      const weekNum = i + 1;
                      const track = series.Tracks.find(
                        (t) => t.week === weekNum
                      );
                      const baseName = track
                        ? getBaseTrackName(track.track)
                        : null;
                      const isOwned = baseName
                        ? ownedTracks.has(baseName)
                        : false;

                      return (
                        <div
                          key={i}
                          className="p-2 flex justify-between items-center"
                        >
                          <span className="text-xs text-gray-500 w-16 shrink-0">
                            Week {weekNum}
                          </span>
                          <span
                            className={`text-xs text-right ${
                              isOwned ? "text-green-400" : "text-gray-300"
                            }`}
                          >
                            {track ? track.track : "-"}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop: Horizontal table */}
                  <div className="hidden sm:block overflow-x-auto hide-scrollbar">
                    <table className="w-full border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-800">
                          {Array.from({ length: seriesMaxWeeks }, (_, i) => (
                            <th
                              key={i}
                              className="border border-gray-600 p-1.5 text-center min-w-20 text-xs font-medium text-gray-400"
                            >
                              Week {i + 1}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-gray-900">
                          {Array.from({ length: seriesMaxWeeks }, (_, i) => {
                            const weekNum = i + 1;
                            const track = series.Tracks.find(
                              (t) => t.week === weekNum
                            );
                            const baseName = track
                              ? getBaseTrackName(track.track)
                              : null;
                            const isOwned = baseName
                              ? ownedTracks.has(baseName)
                              : false;

                            return (
                              <td
                                key={i}
                                className={`border border-gray-600 px-2 py-1.5 text-center ${
                                  isOwned ? "text-green-400" : "text-gray-300"
                                }`}
                              >
                                {track ? track.track : "-"}
                              </td>
                            );
                          })}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredSeries.length === 0 && (
            <p className="text-center text-gray-500 mt-8">
              No series match the current filters.
            </p>
          )}
        </>
      )}

      {activeTab === "myContent" && (
        <MyContent
          allCars={allCars}
          allTracks={allTracks}
          ownedCars={ownedCars}
          ownedTracks={ownedTracks}
          freeCars={freeCars}
          freeTracks={freeTracks}
          toggleCar={toggleCar}
          toggleTrack={toggleTrack}
        />
      )}

      {activeTab === "recommended" && (
        <RecommendedSeries
          series={scheduleData as Series[]}
          ownedTracks={ownedTracks}
          ownedCars={ownedCars}
          getBaseTrackName={getBaseTrackName}
        />
      )}
    </div>
  );
}

export default App;
