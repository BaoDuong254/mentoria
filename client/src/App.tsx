import { Routes, Route, BrowserRouter } from "react-router-dom";
import path from "./utils/path";

import Home from "./pages/public/Home";
import LoginMentee from "./pages/public/LoginMentee";
import LoginMentor from "./pages/public/LoginMentor";
import SigninMentee from "./pages/public/SigninMentee";
import SigninMentor from "./pages/public/SigninMentor";
import MentorBrowse from "./pages/public/MentorBrowse";
import MentorProfile from "./pages/public/MentorProfile";

import MentorDashboard from "./pages/mentor/MentorDashboard";

import MenteeDashboard from "./pages/mentee/MenteeDashboard";
import Booking from "./pages/mentee/Booking";

import PublicLayout from "./layouts/PublicLayout/PublicLayout";
import MentorLayout from "./layouts/MentorLayout/MentorLayout";
import MenteeLayout from "./layouts/MenteeLayout/MenteeLayout";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={path.PUBLIC} element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path={path.LOGIN_MENTEE} element={<LoginMentee />} />
          <Route path={path.LOGIN_MENTOR} element={<LoginMentor />} />
          <Route path={path.SIGNIN_MENTEE} element={<SigninMentee />} />
          <Route path={path.SIGNIN_MENTOR} element={<SigninMentor />} />
          <Route path={path.MENTOR_BROWSE} element={<MentorBrowse />} />
          <Route path={path.MENTOR_PROFILE} element={<MentorProfile />} />
        </Route>

        <Route path={path.MENTOR} element={<MentorLayout />}>
          <Route index element={<MentorDashboard />} />
        </Route>

        <Route path={path.MENTEE} element={<MenteeLayout />}>
          <Route index element={<MenteeDashboard />} />
          <Route path={path.MENTEE_BOOKING} element={<Booking />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
