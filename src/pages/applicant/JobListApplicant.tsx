import { useEffect, type ReactElement } from "react";

import emptyState from '../../assets/emptyState.png';
import locationPoint from '../../assets/locationPoint.png';
import logo from '../../assets/logo.png';
import salary from '../../assets/salary.png';
import { ErrorState, Loading } from "../../components";
import { useJobStore } from "../../store/jobStore";
import type { Job } from "../../types";
import type { CardJobProps, ContentProps, SelectedJobContentProps } from './types';
import { useNavigate, type NavigateFunction } from "react-router-dom";

const CardJob = ({ job, selectedJob, onSelect }: CardJobProps): ReactElement => {
  const isSelected = job.id === selectedJob?.id;

  return (
    <div
      onClick={() => onSelect(job)}
      className={`cursor-pointer flex flex-col w-full text-black border-2 rounded-lg px-4 py-3 mb-3 transition-all duration-150 ease-in-out ${isSelected ? 'border-teal-700 bg-cyan-50' : 'border-gray-300 bg-white'
        }`}
    >
      <div className="flex flex-row w-full gap-4">
        <img className="w-12 h-12" src={logo} alt="Company logo" />
        <div className="flex flex-col">
          <p className="font-bold">{job.title}</p>
          <p>{job.company_name}</p>
        </div>
      </div>
      <hr className="border-t-2 border-dotted border-gray-300 mt-2 mb-2" />
      <span className="flex flex-row gap-1 items-center mb-2">
        <img className="w-4 h-4" src={locationPoint} alt="Location" />
        <p className="text-xs">Jakarta Selatan</p>
      </span>
      <span className="flex flex-row gap-1 items-center">
        <img className="w-4 h-4" src={salary} alt="Salary" />
        <p className="text-xs">{job.salary_range?.display_text}</p>
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
  <div className="p-6 bg-white w-full h-full flex flex-col justify-center items-center">
    <img src={emptyState} className="w-75" alt="Empty state" />
    <p className="text-xl font-bold mb-4 text-black">No job openings available</p>
    <p className="text-black text-base">Please wait for the next batch of openings.</p>
  </div>
);

const SelectedJobContent = ({ selectedJob, navigate }: SelectedJobContentProps): ReactElement => (
  <div className="w-full h-full flex flex-col p-6 gap-6 border border-gray-300 rounded-lg">
    <div className="flex flex-row border-b border-gray-300 pb-6">
      <img className="w-12 h-12 mr-6" src={logo} alt="Company logo" />
      <div className="flex flex-col w-full">
        <div className="flex flex-row justify-between mb-2">
          <p className="flex font-bold text-white bg-green-600 px-4 py-1 rounded-lg text-center items-center justify-center">
            {selectedJob.jobs_type}
          </p>
          <button onClick={() => {
            navigate(`/application-form`)
          }} className="cursor-pointer flex text-center items-center justify-center font-bold text-white bg-yellow-500 px-4 py-1 rounded-lg">
            Apply
          </button>
        </div>
        <p className="font-bold text-black text-lg">{selectedJob.title}</p>
        <p className="text-sm text-gray-500">Rakamin</p>
      </div>
    </div>
    <div>
      {selectedJob.description.map((item: string, index: number) => (
        <p className="text-black text-sm leading-6" key={index}>
          {item}
        </p>
      ))}
    </div>
  </div>
);

const Content = ({ jobs, selectedJob, onSelectJob, navigate }: ContentProps): ReactElement => (
  <div className="flex w-full flex-row">
    <div className="w-1/3 mr-2 overflow-y-auto h-[calc(100vh-2rem)] pr-1">
      {jobs.map((job: Job) => (
        <CardJob
          key={job.id}
          job={job}
          selectedJob={selectedJob}
          onSelect={onSelectJob}
        />
      ))}
    </div>
    <div className="w-2/3">
      {selectedJob && <SelectedJobContent selectedJob={selectedJob} navigate={navigate} />}
    </div>
  </div>
);

const JobListApplicant = (): ReactElement => {
  const navigate: NavigateFunction = useNavigate();
  const { jobs, loading, error, fetchJobs, setSelectedJob, selectedJob } = useJobStore();

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const renderContent = () => {
    if (loading) return <LoadingState />;
    if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
    if (jobs.length === 0) return <EmptyJobList />;

    return <Content jobs={jobs} selectedJob={selectedJob} onSelectJob={setSelectedJob} navigate={navigate} />;
  };

  return (
    <div className="py-10 px-27 flex bg-white w-full h-full">
      {renderContent()}
    </div>
  );
};

export default JobListApplicant;