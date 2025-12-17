import type { Discipline, LicenseClass } from "../types";

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

interface SideNavProps {
  selectedDisciplines: Set<Discipline>;
  selectedClasses: Set<LicenseClass>;
  toggleDiscipline: (discipline: Discipline) => void;
  toggleClass: (cls: LicenseClass) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function SideNav({
  selectedDisciplines,
  selectedClasses,
  toggleDiscipline,
  toggleClass,
  isOpen,
  onClose,
}: SideNavProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidenav */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 lg:z-auto
          h-dvh lg:h-auto lg:self-start
          w-64 lg:w-48 xl:w-56
          bg-gray-900 lg:bg-gray-900/50
          border-r border-gray-700 lg:border lg:rounded-lg
          transform transition-transform duration-200 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          overflow-y-auto
          p-4
        `}
      >
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="lg:hidden absolute top-3 right-3 text-gray-400 hover:text-white cursor-pointer"
        >
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>

        <h3 className="text-sm font-semibold text-gray-300 mb-4 mt-1 lg:mt-0">
          <i className="fa-solid fa-filter mr-2"></i>
          Filters
        </h3>

        {/* Discipline Filter */}
        <div className="mb-5">
          <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
            Discipline
          </h4>
          <div className="flex flex-col gap-1.5">
            {disciplines.map((d) => (
              <button
                key={d}
                onClick={() => toggleDiscipline(d)}
                className={`px-3 py-2 text-xs rounded-lg border transition-all cursor-pointer text-left ${
                  selectedDisciplines.has(d)
                    ? "bg-blue-600/30 border-blue-500 text-blue-300"
                    : "bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-gray-300"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Class Filter */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
            License Class
          </h4>
          <div className="flex flex-col gap-1.5">
            {classes.map((c) => (
              <button
                key={c}
                onClick={() => toggleClass(c)}
                className={`px-3 py-2 text-xs rounded-lg border transition-all cursor-pointer text-left ${
                  selectedClasses.has(c)
                    ? "bg-blue-600/30 border-blue-500 text-blue-300"
                    : "bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-gray-300"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
