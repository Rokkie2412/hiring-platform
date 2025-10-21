import { useEffect, type ReactElement } from "react";
import { useNavigate, useParams, type NavigateFunction } from "react-router-dom";

import applicantAvatar from "../../assets/applicantAvatar.png";
import emptyState from "../../assets/emptyState.png";
import locationPoint from "../../assets/locationPoint.png";
import logo from "../../assets/logo.png";
import salary from "../../assets/salary.png";
import { ErrorState, Loading } from "../../components";
import { useJobStore } from "../../store/jobStore";
import type { Job } from "../../types";

import type { CardJobProps, ContentProps, SelectedJobContentProps } from "./types";

const TopBar = (): React.ReactElement => (
  <header className="fixed top-0 left-0 w-full bg-white shadow-sm border-b border-gray-200 flex justify-between items-center px-4 sm:px-8 h-13 sm:h-16 z-50">
    <div className="flex items-center">
      <h1 className="text-lg sm:text-xl font-bold text-gray-700 tracking-wide">JobList</h1>
    </div>
    <div className="flex items-center gap-4 sm:gap-6">
      <div className="hidden sm:block h-6 border-l border-gray-300" />
      <img src={applicantAvatar} alt="User Avatar" className="w-7 h-7 sm:w-10 sm:h-10 rounded-full border border-gray-300 object-cover" />
    </div>
  </header>
);

const CardJob = ({ job, selectedJob, onSelect }: CardJobProps): ReactElement => {
  const isSelected = job.id === selectedJob?.id;
  return (
    <div
      onClick={() => onSelect(job)}
      className={`cursor-pointer flex flex-col w-full text-black border-2 rounded-lg px-4 py-3 mb-3 transition-all duration-150 ease-in-out 
        ${isSelected ? "border-teal-700 bg-cyan-50" : "border-gray-300 bg-white"}
        hover:shadow-md`}
    >
      <div className="flex flex-row items-center w-full gap-4">
        <img className="w-12 h-12" src={logo} alt="Company logo" />
        <div className="flex flex-col">
          <p className="font-bold text-sm sm:text-base">{job.title}</p>
          <p className="text-xs sm:text-sm text-gray-600">{job.company_name}</p>
        </div>
      </div>
      <hr className="border-t-2 border-dotted border-gray-300 mt-2 mb-2" />
      <span className="flex flex-row gap-1 items-center mb-2">
        <img className="w-4 h-4" src={locationPoint} alt="Location" />
        <p className="text-xs sm:text-sm">Jakarta Selatan</p>
      </span>
      <span className="flex flex-row gap-1 items-center">
        <img className="w-4 h-4" src={salary} alt="Salary" />
        <p className="text-xs sm:text-sm">{job.salary_range?.display_text}</p>
      </span>
    </div>
  );
};

const LoadingState = (): ReactElement => (
  <div className="p-6 bg-white w-full h-full flex flex-col justify-center items-center">
    <Loading text="Loading jobs..." />
  </div>
);

const EmptyJobList = (): ReactElement => (
  <div className="p-6 bg-white w-full h-full flex flex-col justify-center items-center text-center">
    <img src={emptyState} className="w-64 mb-6" alt="Empty state" />
    <p className="text-xl font-bold mb-2 text-black">No job openings available</p>
    <p className="text-gray-600 text-sm sm:text-base">Please wait for the next batch of openings.</p>
  </div>
);

const SelectedJobContent = ({ selectedJob, navigate }: SelectedJobContentProps): ReactElement => (
  <div className="w-full h-full flex flex-col p-4 sm:p-6 gap-6 border border-gray-300 rounded-lg bg-white">
    <div className="flex flex-col sm:flex-row sm:items-center border-b border-gray-300 pb-4 sm:pb-6">
      <img className="w-12 h-12 mb-4 sm:mb-0 sm:mr-6" src={logo} alt="Company logo" />
      <div className="flex flex-col w-full">
        <div className="flex flex-col sm:flex-row sm:justify-between mb-2 gap-3 sm:gap-0">
          <p className="inline-flex items-center justify-center font-bold text-white bg-[#43936C] px-3 py-1 rounded-lg text-xs sm:text-sm leading-none w-fit">
            {selectedJob.jobs_type}
          </p>
          <button
            onClick={() => navigate(`/application-form/${selectedJob.slug}/${selectedJob.id}`)}
            className="cursor-pointer bg-[#FBC037] font-bold text-black px-4 py-1 rounded-lg text-sm sm:text-base"
          >
            Apply
          </button>
        </div>
        <p className="font-bold text-black text-base sm:text-lg">{selectedJob.title}</p>
        <p className="text-sm text-gray-500">{selectedJob.company_name}</p>
      </div>
    </div>
    <div className="overflow-y-auto pr-3 scrollbar-gutter-stable max-h-[50vh] sm:max-h-[60vh]">
      {selectedJob.description.map((item: string, index: number) => (
        <p className="text-black text-sm sm:text-base leading-6 mb-2" key={index}>{item}</p>
      ))}
    </div>
  </div>
);

const Content = ({ jobs, selectedJob, onSelectJob, navigate }: ContentProps): ReactElement => {
  const handleSelect = (job: Job) => {
    onSelectJob(job);
    navigate(`/job/${encodeURIComponent(job?.slug || "")}/${job?.id}`);
  };
  return (
    <div className="flex flex-col sm:flex-row w-full gap-4 sm:h-[calc(100vh-3rem)] transition-all duration-200 mt-14">
      <div className="w-full sm:w-1/3 overflow-y-auto pr-4 scrollbar-gutter-stable h-[50vh] sm:h-auto">
        {jobs.map((job: Job) => (
          job.status === "Active" ? (
            <CardJob key={job.id} job={job} selectedJob={selectedJob} onSelect={handleSelect} />
          ) : null
        ))}
      </div>
      <div className="w-full sm:w-2/3">
        {selectedJob ? (
          <SelectedJobContent selectedJob={selectedJob} navigate={navigate} />
        ) : (
          <div className="border border-gray-200 rounded-lg p-6 flex items-center justify-center text-gray-500 text-sm sm:text-base">
            Select a job to see details
          </div>
        )}
      </div>
    </div>
  );
};

const JobListApplicant = (): ReactElement => {
  const navigate: NavigateFunction = useNavigate();
  const { jobs, loading, error, fetchJobs, setSelectedJob, selectedJob } = useJobStore();
  const { job_id } = useParams();

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    if (jobs.length > 0 && job_id) {
      const foundJob = jobs.find((j) => j.id === job_id);
      if (foundJob) setSelectedJob(foundJob);
    }
  }, [jobs, job_id, setSelectedJob]);

  const renderContent = () => {
    if (loading) return <LoadingState />;
    if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
    if (jobs.length === 0) return <EmptyJobList />;
    return <Content jobs={jobs} selectedJob={selectedJob} onSelectJob={setSelectedJob} navigate={navigate} />;
  };

  return (
    <div className="py-6 sm:py-10 px-4 sm:px-10 flex bg-gray-50 w-full h-full min-h-screen">
      <TopBar />
      {renderContent()}
    </div>
  );
};

export default JobListApplicant;
