import { create } from "zustand";

import supabase from "../lib/supabase";
import type { DbRequirementsField, Job, JobStore } from "../types";
import type { JobFormValues } from "../pages/admin/types";

const formatCreatedAt = (dateInput?: string | Date): string => {
  if (!dateInput) return "";

  const date = new Date(dateInput);

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};


export const useJobStore = create<JobStore>((set) => ({
  jobs: [],
  loading: false,
  error: null,
  selectedJob: null,
  applicationForm: [],

  fetchApplicationForm: async (selectedJob: Job) => {
    set({ loading: true, error: null });

    try {
      if (!selectedJob) return;
      const { data, error } = await supabase.from("form_requirements").select("*").eq("id", selectedJob.id);
      console.log(data?.[0].field)
      if (error) throw new Error(error.message);
      set({ applicationForm: data?.[0].field || [], loading: false });   
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network error";
      set({ error: message, loading: false });
    }
  },

  fetchJobs: async () => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase.from("job_list").select();
      if (error) throw new Error(error.message);
      set({ jobs: data || [], loading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network error";
      set({ error: message, loading: false });
    }
  },

  insertJob: async (value: JobFormValues, jobStatus: string, fieldDb: DbRequirementsField[]) => {
    set({ loading: true, error: null });

    try {
      const { data: newJobId, error: rpcError } = await supabase
        .rpc('generate_next_job_id');

      if (rpcError) throw new Error(rpcError.message);

      console.log(newJobId)

      const { data: jobData, error: jobError } = await supabase
        .from("job_list")
        .insert([
          {
            id: newJobId, 
            created_at: new Date(),
            slug: value.jobName,
            title: value.jobName,
            company_name: value.company_name,
            status: jobStatus,
            jobs_type: value.jobType,
            description: [value.jobDescription],
            candidate_number: value.candidateNumber,
            salary_range: {
              max: value.salaryMax,
              min: value.salaryMin,
              currency: "IDR",
              display_text: `Rp${value.salaryMin} - Rp${value.salaryMax}`
            },
            list_card: {
              cta: "Manage Job",
              badge: jobStatus,
              started_on_text: `started on ${formatCreatedAt(new Date())}`
            },
          },
        ])
        .select()
        .single();

      console.log(jobData)
      console.log(jobError)
      if (jobError) throw new Error(jobError.message);

      const { error: reqError } = await supabase
        .from('form_requirements')
        .insert({
          id: newJobId,
          created_at: new Date(),
          title: value.jobName,
          field: fieldDb,
        });

      if (reqError) throw new Error(reqError.message);

      console.log("✅ Job inserted:", jobData);

      set(() => ({
        loading: false,
      }));

      // return jobData;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to insert job";
      console.error("❌ Error inserting job:", message);
      set({ error: message, loading: false });
      return null;
    }
  },

  setSelectedJob: (job) => set({ selectedJob: job }),
}));
