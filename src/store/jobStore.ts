import { create } from "zustand";

import supabase from "../lib/supabase";
import type { DbRequirementsField, Job, JobStore } from "../types";
import type { JobFormValues } from "../pages/admin/types";
import type { ApplicationForm } from "../pages/applicant/types";
import { showSuccessToast, showErrorToast} from '../components'

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
  photoTemp: '',
  jobs: [],
  loading: false,
  error: null,
  selectedJob: null,
  applicationForm: [],
  applicants: [],

  fetchApplicationForm: async (selectedJob: Job) => {
    set({ loading: true, error: null });

    try {
      if (!selectedJob) return;
      const { data, error } = await supabase.from("form_requirements").select("*").eq("id", selectedJob.id);
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

      const slug = value.jobName.toLowerCase().replace(/\s+/g, "-");

      const { error: jobError } = await supabase
        .from("job_list")
        .insert([
          {
            id: newJobId, 
            created_at: new Date(),
            slug: slug,
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

      set(() => ({
        loading: false,
      }));

      showSuccessToast();

      // return jobData;
    } catch (err) {
      showErrorToast()
      const message = err instanceof Error ? err.message : "Failed to insert job";
      console.error("❌ Error inserting job:", message);
      set({ error: message, loading: false });
      return null;
    }
  },

  insertApplicants: async (values: ApplicationForm, photoTemp: string, selectedJobId: string) => {
    set({ loading: true, error: null });
  
    try {
      const { data: newCandidateId, error: rpcError } = await supabase
        .rpc('generate_next_candidate_id');
  
      if (rpcError) throw new Error(rpcError.message);
  
      const { error: applicantError } = await supabase
        .from("applicants")
        .insert([
          {
            id: newCandidateId, 
            job_id: selectedJobId,
            attributes: [
              { key: "fullName", label: "Full Name", value: values.full_name, order: 1},
              { key: "email", label: "Email", value: values.email, order: 2 },
              { key: "phone", label: "Phone", value: values.phone_number, order: 3 },
              { key: "domicile", label: "Domicile", value: values.domicile, order: 4 },
              { key: "gender", label: "Gender", value: values.gender, order: 5 },
              { key: "linkedin_link", label: "LinkedIn", value: values.linkedin_link, order: 6 },
              { key: "photo_profile", label: "Photo Profile", value: photoTemp, order: 7},
            ]
          }
        ]);
  
      if (applicantError) throw applicantError;
  
      set(() => ({ loading: false }));

      showSuccessToast();
      
    } catch (err) {
      showErrorToast();
      const message = err instanceof Error ? err.message : "Network error";
      console.error('Full error:', err);
      set({ error: message, loading: false });
    }
  },

  fetchManageJob: async (id: string) => {
    set({ loading: true, error: null });

    try {
      const { data } = await supabase.from("applicants").select().eq("job_id", id);
      set({ applicants: data || [] || [], loading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network error";
      console.log(message);
      set({ error: message, loading: false });
    }
  },

  setSelectedJob: (job) => set({ selectedJob: job }),
  setPhotoTemp: (photo: string) => set({ photoTemp: photo }),
}));
