import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useLocation, useNavigate, type NavigateFunction } from "react-router-dom";

import adminAvatar from "../../assets/adminAvatar.png";
import buttonBackground from "../../assets/buttonBackgroundImage.jpg";
import emptyState from "../../assets/emptyState.png";
import searchIcon from "../../assets/search.png";
import { Loading, StatusBadge } from "../../components";
import { useJobStore } from "../../store/jobStore";
import type { Job } from "../../types";

import AddJobModal from "./ModalForm";

const TopBar = () => (
  <header className="fixed w-full z-50 flex justify-between items-center bg-white px-4 sm:px-6 h-14 sm:h-16 border-b-2 border-gray-300 shadow-sm">
    <h1 className="text-base sm:text-lg font-bold text-gray-800">Job List</h1>
    <img
      src={adminAvatar}
      alt="User Avatar"
      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-indigo-300 transition-all"
    />
  </header>
);

const CreateJobBanner = (navigate: NavigateFunction) => (
  <div
    className="relative flex flex-col items-center justify-center gap-3 sm:gap-4 p-4 sm:p-6 rounded-2xl text-white overflow-hidden min-h-[200px]"
    style={{
      backgroundImage: `url(${buttonBackground})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}
  >
    <div className="absolute inset-0 bg-black/65" />
    <div className="relative z-10 flex flex-col items-center text-center gap-3 sm:gap-4">
      <p className="text-lg sm:text-2xl font-bold">Recruit the best candidates</p>
      <p className="text-sm sm:text-base font-medium">
        Create jobs, invite, and hire with ease
      </p>
      <button
        onClick={() => navigate("/admin/add-job")}
        className="cursor-pointer bg-[#01777F] font-semibold text-white px-5 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-[#01656d] transition-all text-sm sm:text-base"
      >
        Create a new job
      </button>
    </div>
  </div>
);

const JobListCard = (job: Job, navigate: NavigateFunction, setSelectedJob: (job: Job) => void) => (
  <div className="flex flex-col mb-3 w-full bg-white p-4 sm:p-6 gap-3 sm:gap-4 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.09)] transition-shadow duration-200">
    <div className="flex flex-row flex-wrap items-center gap-2 sm:gap-3">
      {job.list_card?.badge && <StatusBadge type={job.list_card.badge.toLowerCase()} />}
      <p className="text-black py-1 px-3 border border-gray-300 rounded-md text-xs sm:text-sm">
        {job.list_card?.started_on_text || ""}
      </p>
    </div>
    <p className="text-black font-bold text-base sm:text-lg">{job.title}</p>
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
      <p className="text-gray-700 text-sm sm:text-base">
        {job.salary_range?.display_text}
      </p>
      <button
        onClick={() => {
          setSelectedJob(job);
          navigate(`/admin/manage-job/${job.id}`);
        }}
        className="bg-[#01777F] font-semibold text-white px-4 py-2 rounded-md hover:bg-[#01656d] transition-colors cursor-pointer text-sm sm:text-base"
      >
        {job.list_card?.cta || "View"}
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
      <div className="p-4 sm:p-6 bg-white w-full flex flex-col justify-center items-center text-center">
        <img src={emptyState} className="w-48 sm:w-72 mb-3 sm:mb-4" alt="Empty state" />
        <p className="text-lg sm:text-xl font-bold text-black mb-1 sm:mb-2">
          {searchTerm ? "No jobs match your search" : "No job openings available"}
        </p>
        {!searchTerm && (
          <>
            <p className="text-black text-sm sm:text-base mb-3 sm:mb-4">
              Create a job opening now and start the candidate process.
            </p>
            <button
              onClick={() => navigate("/admin/add-job")}
              className="bg-yellow-500 text-black font-bold text-sm sm:text-base px-4 py-2 rounded-lg cursor-pointer"
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
  const { jobs, loading, error, fetchJobs, setSelectedJob } = useJobStore();

  const [searchTerm, setSearchTerm] = useState<string>("");

  const showCreateModal = location.pathname === "/admin/add-job";

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

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
    <div className="flex flex-col bg-gray-50 min-h-screen w-full">
      <TopBar />
      {LoadingState(loading)}

      <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 mt-20 px-4 sm:px-6 pb-8">
        <div className="flex-1">
          <div className="sticky top-16 bg-gray-50 z-40 mb-5">
            <span className="w-full flex flex-row gap-2 sm:gap-4 border py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg bg-white border-gray-300 shadow-sm">
              <input
                ref={inputRef}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-black outline-none text-sm sm:text-base"
                placeholder="Search by job title, company, or salary"
              />
              <img
                onClick={() => inputRef.current?.focus()}
                className="w-5 h-5 sm:w-6 sm:h-6 cursor-pointer"
                src={searchIcon}
                alt="Search"
              />
            </span>
          </div>
          <div className="flex flex-col gap-3 sm:gap-4">
            {EmptyJobList(filteredJobs, loading, navigate, error, searchTerm)}
            {!loading && !error && filteredJobs.length > 0 && (
              <div className="flex flex-col gap-4">
                {filteredJobs.map((job: Job) => (
                  <div key={job.id}>{JobListCard(job, navigate, setSelectedJob)}</div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="lg:w-[30%] xl:w-[25%] w-full">
          {CreateJobBanner(navigate)}
        </div>
      </div>

      {showCreateModal && <AddJobModal />}
    </div>
  );
};

export default JobAdmin;