import { Outlet } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
// import MenteeDashboardComponent from "@/components/MenteeDashboard";

export default function MenteeLayout() {
  return (
    <>
      <Header />
      <main>
        {/* <MenteeDashboard /> */}
        {/* <MenteeDashboardComponent
          mentors={[
            {
              id: "1",
              name: "John Doe",
              avatar: "https://i.pravatar.cc/150?img=1",
              specialty: "React",
              hourlyRate: 50,
              topic: "Advanced Hooks",
              scheduledDate: "2025-11-20",
              scheduledTime: "10:00 AM",
              isConfirmed: true
            }
          ]}
          onJoinMeeting={(mentorId) => {
            console.log("Joining meeting with mentor:", mentorId);
            // Xử lý logic join meeting
          }}
          onReschedule={(mentorId) => {
            console.log("Rescheduling with mentor:", mentorId);
            // Xử lý logic reschedule
          }}
        /> */}
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
