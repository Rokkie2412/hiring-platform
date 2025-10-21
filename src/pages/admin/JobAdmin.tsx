import { useEffect, useRef, useState, useMemo, type ReactNode } from "react";
import { useLocation, useNavigate, type NavigateFunction } from "react-router-dom";

import buttonBackground from "../../assets/buttonBackgroundImage.jpg";
import emptyState from "../../assets/emptyState.png";
import searchIcon from "../../assets/search.png";
import adminAvatar from "../../assets/adminAvatar.png";
import { StatusBadge, Loading } from "../../components";
import { useJobStore } from "../../store/jobStore";
import type { Job } from "../../types";
import AddJobModal from "./ModalForm";
import React from "react";

const TopBar = () => (
  <header className="fixed w-full z-50 flex justify-between items-center bg-white px-6 h-16 border-b-2 border-gray-300 shadow-sm">
    <h1 className="text-lg font-bold text-gray-800">Job List</h1>
    <img
      src={adminAvatar}
      alt="User Avatar"
      className="w-10 h-10 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-indigo-300 transition-all"
    />
  </header>
);

const CreateJobBanner = (navigate: NavigateFunction) => (
  <div
    className="fixed flex flex-col items-center justify-center gap-4 p-6 rounded-2xl text-white overflow-hidden"
    style={{
      backgroundImage: `url(${buttonBackground})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}
  >
    <div className="absolute inset-0 bg-black/65" />
    <div className="relative z-10 flex flex-col items-center text-center gap-4">
      <p className="text-2xl font-bold">Recruit the best candidates</p>
      <p className="text-base font-medium">Create jobs, invite, and hire with ease</p>
      <button
        onClick={() => navigate("/admin/add-job")}
        className="cursor-pointer bg-[#01777F] font-semibold text-white px-6 py-3 rounded-lg hover:bg-[#01656d] transition-all"
      >
        Create a new job
      </button>
    </div>
  </div>
);

const JobListCard = (job: Job) => (
  <div className="flex flex-col mb-3 w-full bg-white p-6 gap-4 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.09)] transition-shadow duration-200">
    <div className="flex flex-row w-full items-center gap-3">
      {job.list_card?.badge && <StatusBadge type={job.list_card.badge.toLowerCase()} />}
      <p className="text-black py-1 px-4 border border-gray-300 rounded-md text-sm">
        {job.list_card?.started_on_text || ""}
      </p>
    </div>
    <p className="text-black font-bold text-lg">{job.title}</p>
    <div className="flex flex-row items-center justify-between w-full">
      <p className="text-gray-700 text-base">{job.salary_range?.display_text}</p>
      <button className="bg-[#01777F] font-semibold text-white px-4 py-2 rounded-md hover:bg-[#01656d] transition-colors cursor-pointer">
        {job.list_card?.cta || ""}
      </button>
    </div>
  </div>
);

const EmptyJobList = (
  jobs: Job[],
  loading: boolean,
  navigate: NavigateFunction,
  error: string | null,
  searchTerm: string
): ReactNode => {
  if (jobs.length === 0 && !loading && !error) {
    return (
      <div className="p-6 bg-white w-full h-full flex flex-col justify-center items-center">
        <img src={emptyState} className="w-72 mb-4" alt="Empty state" />
        <p className="text-xl font-bold text-black mb-2">
          {searchTerm ? "No jobs match your search" : "No job openings available"}
        </p>
        {!searchTerm && (
          <>
            <p className="text-black text-base mb-4">
              Create a job opening now and start the candidate process.
            </p>
            <button
              onClick={() => navigate("/admin/add-job")}
              className="bg-yellow-500 text-black font-bold text-base px-4 py-2 rounded-lg cursor-pointer"
            >
              Create a new job
            </button>
          </>
        )}
      </div>
    );
  }

  return null;
};

const LoadingState = (loading: boolean): ReactNode =>
  loading ? <Loading text="Loading jobs..." /> : null;

const JobAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const { jobs, loading, error, fetchJobs } = useJobStore();

  const [searchTerm, setSearchTerm] = useState<string>("");

  const showCreateModal = location.pathname === "/admin/add-job";

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // ✅ Filtering logic (case-insensitive)
  const filteredJobs = useMemo(() => {
    if (!searchTerm.trim()) return jobs;
    const lower = searchTerm.toLowerCase();
    return jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(lower) ||
        job.company_name?.toLowerCase().includes(lower) ||
        job.salary_range?.display_text?.toLowerCase().includes(lower) ||
        job.list_card?.badge?.toLowerCase().includes(lower)
    );
  }, [searchTerm, jobs]);

  return (
    <div className="flex flex-col bg-white w-full h-full max-h-dvh scrollbar-custom">
      <TopBar />
      {LoadingState(loading)}
      <div className="flex flex-row bg-white w-full h-full mt-20 pr-5">
        {/* Left Side */}
        <div className="w-3/4 h-full mr-3 bg-white">
          <div className="fixed bg-transparent w-3/4 px-5 z-40">
            <span className="w-full flex flex-row gap-4 border-2 py-2.5 px-4 rounded-lg bg-white border-gray-300">
              <input
                ref={inputRef}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-black outline-none"
                placeholder="Search by job title, company, or salary"
              />
              <img
                onClick={() => inputRef.current?.focus()}
                className="w-6 h-6 cursor-pointer"
                src={searchIcon}
                alt="Search"
              />
            </span>
          </div>

          <div className="mt-20">
            {EmptyJobList(filteredJobs, loading, navigate, error, searchTerm)}
            {!loading && !error && filteredJobs.length > 0 && (
              <div className="flex flex-col w-full gap-4 max-h-[calc(100vh-140px)] mx-5 pr-5">
                {filteredJobs.map((job: Job) => (
                  <JobListCard key={job.id} {...job} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side */}
        <div className="w-1/4 ml-3">{CreateJobBanner(navigate)}</div>
      </div>

      {showCreateModal && <AddJobModal />}
    </div>
  );
};

export default JobAdmin;
