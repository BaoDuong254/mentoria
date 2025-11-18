import React from "react";
import styles from "./MenteeDashboard.module.css";

interface Mentor {
  id: string;
  name: string;
  avatar: string;
  specialty: string;
  hourlyRate: number;
  topic: string;
  scheduledDate: string;
  scheduledTime: string;
  isConfirmed: boolean;
}

interface MenteeDashboardProps {
  mentors: Mentor[];
  onJoinMeeting: (mentorId: string) => void;
  onReschedule: (mentorId: string) => void;
}

const MenteeDashboard: React.FC<MenteeDashboardProps> = ({ mentors, onJoinMeeting, onReschedule }) => {
  return (
    <div className={styles.dashboardContainer}>
      {mentors.map((mentor) => (
        <div key={mentor.id} className={styles.mentorCard}>
          <div className={styles.cardContent}>
            <div className={styles.avaAndInfo}>
              <img src={mentor.avatar} alt={mentor.name} className={styles.avatar} />
              <div className={styles.mentorInfo}>
                <h3 className={styles.mentorName}>{mentor.name}</h3>
                <p className={styles.specialty}>{mentor.specialty}</p>
                <p className={styles.rate}>${mentor.hourlyRate}/hour</p>
              </div>
            </div>

            <div className={styles.topicFrame}>
              <p className={styles.topicText}>{mentor.topic}</p>
            </div>

            <div className={styles.bottomSection}>
              <div className={styles.scheduleInfo}>
                <span className={styles.scheduleIcon}>📅</span>
                <span className={styles.scheduleText}>
                  {mentor.scheduledDate} {mentor.scheduledTime}
                </span>
              </div>

              <div className={styles.actionButtons}>
                <button
                  className={styles.joinButton}
                  onClick={() => {
                    onJoinMeeting(mentor.id);
                  }}
                >
                  🎥 Join Meeting
                </button>
                <button
                  className={styles.rescheduleButton}
                  onClick={() => {
                    onReschedule(mentor.id);
                  }}
                >
                  Reschedule
                </button>
              </div>
            </div>
          </div>

          {mentor.isConfirmed && <div className={styles.confirmedBadge}>Confirmed</div>}
        </div>
      ))}
    </div>
  );
};

export default MenteeDashboard;
