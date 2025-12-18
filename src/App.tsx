import { useState, useMemo } from "react";
import scheduleData from "./data/schedule.json";
import classesData from "./data/classes.json";
import type { Series, LicenseClass, Discipline } from "./types";
import { useOwnedContent } from "./hooks/useOwnedContent";
import { MyContent } from "./components/MyContent";
import { RecommendedSeries } from "./components/RecommendedSeries";
import { SideNav } from "./components/SideNav";

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

// Helper to find car class from cars listed in track string
function findCarClassFromTrack(trackString: string): string | null {
  for (const carClass of classesData) {
    // Check if any car from this class appears in the track string
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

// Helper to get display text for special series (Draft Master Challenge, Ring Meister)
function getSpecialSeriesTrackDisplay(
  seriesName: string,
  trackString: string
): string | null {
  if (seriesName === "Draft Master Challenge by Simagic") {
    const carClass = findCarClassFromTrack(trackString);
    if (carClass) {
      // Extract first word of track name (Talladega or Daytona)
      const firstWord = trackString.split(" ")[0];
      return `${firstWord} - ${carClass}`;
    }
  } else if (seriesName === "Ring Meister") {
    const carClass = findCarClassFromTrack(trackString);
    if (carClass) {
      return `Nurburgring - ${carClass}`;
    }
  }
  return null;
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("schedule");
  const [sideNavOpen, setSideNavOpen] = useState(false);
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

  const showSideNav = activeTab === "schedule" || activeTab === "recommended";

  return (
    <div className="min-h-dvh flex flex-col">
      {/* AirBnB-style Header */}
      <header className="sticky top-0 z-30 bg-gray-900/95 backdrop-blur border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo/Title - Left */}
            <div className="flex items-center gap-3">
              <img
                src="/schedule.png"
                alt="Logo"
                className="w-8 h-8 sm:w-10 sm:h-10"
              />
              <div className="hidden sm:block">
                <h1 className="text-base font-semibold text-white leading-tight">
                  iRacing Season Planner
                </h1>
                <p className="text-xs text-gray-400">
                  Plan your path to the podium
                </p>
              </div>
            </div>

            {/* Tab Navigation - Center */}
            <nav className="flex items-center gap-1 sm:gap-6">
              <button
                onClick={() => setActiveTab("schedule")}
                className={`flex flex-col items-center px-3 sm:px-4 py-2 cursor-pointer transition-all ${
                  activeTab === "schedule"
                    ? "text-white"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <i
                  className={`fa-solid fa-calendar-days text-lg sm:text-xl mb-1 ${
                    activeTab === "schedule" ? "text-blue-400" : ""
                  }`}
                ></i>
                <span className="text-xs font-medium">Schedule</span>
                {activeTab === "schedule" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
                )}
              </button>

              <button
                onClick={() => setActiveTab("myContent")}
                className={`flex flex-col items-center px-3 sm:px-4 py-2 cursor-pointer transition-all ${
                  activeTab === "myContent"
                    ? "text-white"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <i
                  className={`fa-solid fa-box-open text-lg sm:text-xl mb-1 ${
                    activeTab === "myContent" ? "text-blue-400" : ""
                  }`}
                ></i>
                <span className="text-xs font-medium">Content</span>
              </button>

              <button
                onClick={() => setActiveTab("recommended")}
                className={`flex flex-col items-center px-3 sm:px-4 py-2 cursor-pointer transition-all relative ${
                  activeTab === "recommended"
                    ? "text-white"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <i
                  className={`fa-solid fa-star text-lg sm:text-xl mb-1 ${
                    activeTab === "recommended" ? "text-blue-400" : ""
                  }`}
                ></i>
                <span className="text-xs font-medium">Recommended</span>
              </button>
            </nav>

            {/* Filter button for mobile - Right */}
            <div className="flex items-center">
              {showSideNav && (
                <button
                  onClick={() => setSideNavOpen(true)}
                  className="lg:hidden p-2 text-gray-400 hover:text-white cursor-pointer"
                >
                  <i className="fa-solid fa-sliders text-lg"></i>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Side Navigation */}
        {showSideNav && (
          <SideNav
            selectedDisciplines={selectedDisciplines}
            selectedClasses={selectedClasses}
            toggleDiscipline={toggleDiscipline}
            toggleClass={toggleClass}
            isOpen={sideNavOpen}
            onClose={() => setSideNavOpen(false)}
          />
        )}

        {/* Main Content */}
        <main
          className={`flex-1 p-3 sm:p-4 ${
            showSideNav ? "lg:pl-4" : ""
          } max-w-7xl mx-auto w-full`}
        >
          {/* Tab Content */}
          {activeTab === "schedule" && (
            <>
              {/* Schedule - 4 series per row grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-start">
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
                          className="font-semibold text-white text-sm line-clamp-2"
                          title={carsTooltip}
                        >
                          {series.Series}
                        </div>
                        <div className="text-xs text-gray-300">
                          {series.Discipline} • {series.Class}
                        </div>
                      </div>

                      {/* Tracks list - single column */}
                      <div className="bg-gray-900 p-2 space-y-1">
                        {Array.from({ length: seriesMaxWeeks }, (_, i) => {
                          const weekNum = i + 1;
                          const track = series.Tracks.find(
                            (t) => t.week === weekNum
                          );
                          const baseName = track
                            ? getBaseTrackName(track.track)
                            : null;

                          // Check for special series display
                          const specialDisplay = track
                            ? getSpecialSeriesTrackDisplay(
                                series.Series,
                                track.track
                              )
                            : null;

                          // For special series (Draft Master, Ring Meister), check track AND car ownership
                          const isSpecialSeries =
                            series.Series ===
                              "Draft Master Challenge by Simagic" ||
                            series.Series === "Ring Meister";

                          let isOwned = false;
                          if (baseName && ownedTracks.has(baseName)) {
                            if (isSpecialSeries && track) {
                              // For special series, also need to own at least one car
                              const carsForWeek = getCarsFromTrackString(
                                track.track
                              );
                              isOwned = ownsAnyCar(carsForWeek, ownedCars);
                            } else {
                              isOwned = true;
                            }
                          }

                          const displayText =
                            specialDisplay || track?.track || "-";

                          return (
                            <div
                              key={i}
                              className="flex items-start gap-2 text-xs"
                            >
                              <span className="text-gray-500 w-8 shrink-0 font-medium">
                                {weekNum}
                              </span>
                              <span
                                className={`${
                                  isOwned ? "text-green-400" : "text-gray-300"
                                } wrap-break-word`}
                                title={track?.track}
                              >
                                {displayText}
                              </span>
                            </div>
                          );
                        })}
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
              selectedDisciplines={selectedDisciplines}
              selectedClasses={selectedClasses}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
