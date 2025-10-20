import { BrowserRouter, Routes, Route } from "react-router-dom";

import JobListApplicant from "../pages/applicant/JobListApplicant";
import JobAdmin from "../pages/admin/JobAdmin";
import { ToastContainer } from "react-toastify";
import ApplicationForm from "../pages/applicant/ApplicationForm";

const AppRouter = () => {
  return (
    <>
      <ToastContainer />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<JobListApplicant />} />
          <Route path="/application-form" element={<ApplicationForm />} />
          <Route path="/admin" element={<JobAdmin />}>
            <Route path="add-job" element={<JobAdmin />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default AppRouter