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
    <div className="min-h-screen p-2">
      <h1 className="text-2xl font-bold text-center mb-4 text-gray-100">
        iRacing Season Planner
      </h1>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-6">
        <div className="flex bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("schedule")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === "schedule"
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Schedule
          </button>
          <button
            onClick={() => setActiveTab("myContent")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === "myContent"
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            My Content
          </button>
          <button
            onClick={() => setActiveTab("recommended")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === "recommended"
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white"
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

          {/* Schedule - Each series as separate table */}
          <div className="space-y-3">
            {filteredSeries.map((series, idx) => {
              const headerColor =
                classColors[series.Class as LicenseClass] || "bg-gray-700";
              const rowBg = idx % 2 === 0 ? "bg-gray-900" : "bg-slate-900";
              const carsTooltip = series.Cars.join(", ");

              // Calculate max weeks for this specific series
              const seriesMaxWeeks = Math.max(
                ...series.Tracks.map((t) => t.week),
                0
              );

              return (
                <div key={idx} className="overflow-x-auto group">
                  <table className="w-full border-collapse text-xs transition-all hover:brightness-110">
                    <thead>
                      <tr className={headerColor}>
                        <th
                          className="border border-gray-600 px-2 py-1 text-left sticky left-0 z-10 cursor-help min-w-50"
                          style={{ backgroundColor: "inherit" }}
                          title={carsTooltip}
                        >
                          {series.Series}
                          <span className="block text-[10px] text-gray-300 font-normal">
                            {series.Discipline}
                          </span>
                        </th>
                        {Array.from({ length: seriesMaxWeeks }, (_, i) => (
                          <th
                            key={i}
                            className="border border-gray-600 px-1 py-1 text-center min-w-30 text-[10px] font-medium"
                          >
                            Week {i + 1}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className={rowBg}>
                        <td
                          className={`border border-gray-600 px-2 py-1 sticky left-0 z-10 ${rowBg}`}
                        >
                          <span className="text-gray-400 text-[10px]">
                            Track
                          </span>
                        </td>
                        {Array.from({ length: seriesMaxWeeks }, (_, i) => {
                          const weekNum = i + 1;
                          const track = series.Tracks.find(
                            (t) => t.week === weekNum
                          );
                          return (
                            <td
                              key={i}
                              className={`border border-gray-600 px-1 py-1 text-center ${rowBg}`}
                            >
                              {track ? track.track : "-"}
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
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
