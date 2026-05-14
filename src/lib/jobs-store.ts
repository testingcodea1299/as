import { useEffect, useState } from "react";
import type { Job } from "./mock-data";
import { MOCK_JOBS } from "./mock-data";

const KEY = "workverse.jobs";

export type NewJob = Omit<Job, "id" | "postedAt" | "distanceKm"> & {
  distanceKm?: number;
  postedBy?: string;
};

function load(): Job[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Job[]) : [];
  } catch {
    return [];
  }
}

function save(jobs: Job[]) {
  localStorage.setItem(KEY, JSON.stringify(jobs));
  window.dispatchEvent(new Event("workverse:jobs"));
}

export function useJobs(): { all: Job[]; userJobs: Job[]; addJob: (j: NewJob) => Job; removeJob: (id: string) => void } {
  const [userJobs, setUserJobs] = useState<Job[]>([]);

  useEffect(() => {
    const sync = () => setUserJobs(load());
    sync();
    window.addEventListener("workverse:jobs", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("workverse:jobs", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const addJob = (j: NewJob): Job => {
    const newJob: Job = {
      id: `u${Date.now()}`,
      title: j.title,
      type: j.type,
      company: j.company,
      location: j.location,
      distanceKm: j.distanceKm ?? Number((Math.random() * 1.8 + 0.3).toFixed(1)),
      salary: j.salary,
      skills: j.skills,
      postedAt: "vừa đăng",
    };
    const next = [newJob, ...load()];
    save(next);
    return newJob;
  };

  const removeJob = (id: string) => {
    save(load().filter((j) => j.id !== id));
  };

  return { all: [...userJobs, ...MOCK_JOBS], userJobs, addJob, removeJob };
}
