import { useState, useEffect, useCallback } from "react";

const DB_NAME = "iRacingPlannerDB";
const DB_VERSION = 1;
const STORE_NAME = "ownedContent";

interface OwnedContent {
  cars: Set<string>;
  tracks: Set<string>;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
  });
}

async function loadFromDB(): Promise<OwnedContent> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get("owned");

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const result = request.result;
      if (result) {
        resolve({
          cars: new Set(result.cars || []),
          tracks: new Set(result.tracks || []),
        });
      } else {
        resolve({ cars: new Set(), tracks: new Set() });
      }
    };
  });
}

async function saveToDB(content: OwnedContent): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put({
      id: "owned",
      cars: Array.from(content.cars),
      tracks: Array.from(content.tracks),
    });

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export function useOwnedContent(
  freeCars: Set<string>,
  freeTracks: Set<string>
) {
  const [ownedCars, setOwnedCars] = useState<Set<string>>(new Set());
  const [ownedTracks, setOwnedTracks] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from IndexedDB on mount
  useEffect(() => {
    loadFromDB()
      .then((content) => {
        // Merge with free content (free content is always owned)
        const mergedCars = new Set([...content.cars, ...freeCars]);
        const mergedTracks = new Set([...content.tracks, ...freeTracks]);
        setOwnedCars(mergedCars);
        setOwnedTracks(mergedTracks);
        setIsLoaded(true);
      })
      .catch((err) => {
        console.error("Failed to load owned content:", err);
        // Still set free content as owned
        setOwnedCars(new Set(freeCars));
        setOwnedTracks(new Set(freeTracks));
        setIsLoaded(true);
      });
  }, [freeCars, freeTracks]);

  // Save to IndexedDB whenever owned content changes
  useEffect(() => {
    if (isLoaded) {
      saveToDB({ cars: ownedCars, tracks: ownedTracks }).catch((err) =>
        console.error("Failed to save owned content:", err)
      );
    }
  }, [ownedCars, ownedTracks, isLoaded]);

  const toggleCar = useCallback(
    (car: string) => {
      // Don't allow toggling off free content
      if (freeCars.has(car)) return;

      setOwnedCars((prev) => {
        const next = new Set(prev);
        if (next.has(car)) {
          next.delete(car);
        } else {
          next.add(car);
        }
        return next;
      });
    },
    [freeCars]
  );

  const toggleTrack = useCallback(
    (track: string) => {
      // Don't allow toggling off free content
      if (freeTracks.has(track)) return;

      setOwnedTracks((prev) => {
        const next = new Set(prev);
        if (next.has(track)) {
          next.delete(track);
        } else {
          next.add(track);
        }
        return next;
      });
    },
    [freeTracks]
  );

  return {
    ownedCars,
    ownedTracks,
    toggleCar,
    toggleTrack,
    isLoaded,
  };
}
