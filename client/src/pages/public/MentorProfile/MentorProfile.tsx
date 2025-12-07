/* eslint-disable react-hooks/set-state-in-effect */
import { Star, Users, Clock, Check } from "lucide-react";
import { FaLinkedinIn, FaTwitter, FaGithub, FaGlobe, FaFacebook, FaInstagram } from "react-icons/fa";
import Review from "./Components/Review";
import { useParams, useNavigate } from "react-router-dom";
import { useSearchStore } from "@/store/useSearchStore";
import { useEffect, useMemo, useState } from "react";
function MentorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedMentor, fetchMentorById } = useSearchStore();
  //state for monthly plan or session
  const [planType, setPlanType] = useState<"session" | "monthly">("monthly");
  //state for selected plan id
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (id) {
      void fetchMentorById(id);
    }
  }, [id, fetchMentorById]);

  const getSocialIcon = (platform: string) => {
    const p = platform.toLowerCase();

    switch (p) {
      case "github":
        return <FaGithub className='h-4 w-4 text-gray-200' />;
      case "linkedin":
        return <FaLinkedinIn className='h-4 w-4 text-[#0A66C2]' />;
      case "twitter":
      case "x":
        return <FaTwitter className='h-4 w-4 text-[#1DA1F2]' />;
      case "website":
      case "portfolio":
        return <FaGlobe className='h-4 w-4 text-teal-400' />;
      case "facebook":
        return <FaFacebook className='h-4 w-4 text-[#1877F2]' />;
      case "instagram":
        return <FaInstagram className='h-4 w-4 text-[#E4405F]' />;
      default:
        // Icon mặc định nếu platform lạ
        return <FaGlobe className='h-4 w-4 text-gray-400' />;
    }
  };
  const { sessionPlans, monthlyPlans } = useMemo(() => {
    if (!selectedMentor?.plans) return { sessionPlans: [], monthlyPlans: [] };

    const sessions = selectedMentor.plans.filter((p) => p.sessions_duration && p.sessions_duration > 0);
    const monthly = selectedMentor.plans.filter((p) => p.benefits && p.benefits.length > 0);

    return { sessionPlans: sessions, monthlyPlans: monthly };
  }, [selectedMentor]);

  useEffect(() => {
    if (selectedMentor) {
      if (planType === "monthly" && monthlyPlans.length === 0 && sessionPlans.length > 0) {
        setPlanType("session");
      } else if (planType === "session" && sessionPlans.length === 0 && monthlyPlans.length > 0) {
        setPlanType("monthly");
      }
    }
  }, [selectedMentor, monthlyPlans, sessionPlans, planType]);

  const activeList = planType === "monthly" ? monthlyPlans : sessionPlans;
  const displayPlan = activeList.find((p) => p.plan_id === selectedPlanId) ?? activeList[0];
  const review = {
    avt: "https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    name: "Alex Johnson",
    star: 4,
    review:
      "Sarah's guidance was invaluable in helping me transition from web development to AI. Her practical approach and industry insights made complex concepts easy to understand.",
  };
  const handleBookSession = () => {
    if (selectedPlanId) {
      void navigate(`/mentee/booking/${String(selectedPlanId)}`);
    }
  };
  return (
    <>
      <div className='flex w-full justify-center bg-(--secondary) py-15'>
        <div className='flex w-11/12'>
          <div className='h-full w-2/3'>
            <div className='flex h-full w-11/12 flex-col gap-7'>
              {/* First component Info */}
              <div className='rounded-xl bg-gray-800 px-7 py-7'>
                <div className='flex'>
                  {/* Avt */}
                  <div className='flex w-2/12 justify-center'>
                    <div className='h-20 w-20 rounded-full bg-red-200 ring-3 ring-(--primary)'>
                      <img
                        src={selectedMentor?.avatar_url}
                        alt={`Avt of ${String(selectedMentor?.first_name)}`}
                        className='rounded-full'
                      />
                    </div>
                  </div>
                  {/* Info */}
                  <div className='flex w-10/12 flex-col gap-4'>
                    <div className='text-2xl font-bold text-white'>
                      {selectedMentor?.sex.toLowerCase() === "male" ? "Dr. " : "Ms. "}
                      {selectedMentor?.first_name} {selectedMentor?.last_name}
                    </div>
                    <span className='text-gray-300'>
                      {selectedMentor?.companies[0].job_name} at {selectedMentor?.companies[0].company_name}
                    </span>
                    <span className='text-[-16px] text-gray-400'>
                      10+ years in Machine Learning & AI | PhD in Computer Science | Published 50+ research papers
                    </span>
                    <div className='flex gap-5'>
                      <div className='flex gap-2'>
                        <Star className='h-4 w-4 fill-yellow-400 stroke-yellow-400' />
                        <span className='font-bold text-white'>{(selectedMentor?.average_rating ?? 0).toFixed(1)}</span>
                        <span className='text-gray-400'>({selectedMentor?.total_feedbacks} reviews)</span>
                      </div>
                      <div className='flex gap-2'>
                        <Users className='h-4 w-4 fill-(--green) stroke-(--green)' />
                        <span className='text-gray-300'>{selectedMentor?.total_mentees}+ mentees</span>
                      </div>
                      <div className='flex gap-2'>
                        <Clock className='h-4 w-4 rounded-full bg-purple-400 stroke-black' />
                        <span className='text-gray-300'>
                          Usually responds {String(selectedMentor?.response_time).toLowerCase()}
                        </span>
                      </div>
                    </div>
                    <div className='flex gap-3'>
                      {selectedMentor?.social_links && selectedMentor.social_links.length > 0
                        ? selectedMentor.social_links.map((social, index) => (
                            <a
                              href={social.link}
                              key={index}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='cursor-pointer rounded-lg bg-[#374151] p-2 transition-colors hover:bg-gray-600'
                              title={social.platform}
                            >
                              {getSocialIcon(social.platform)}
                            </a>
                          ))
                        : null}
                    </div>
                  </div>
                </div>
              </div>
              {/* Second component Skills and Expertise */}
              <div className='rounded-xl bg-gray-800 px-7 py-7'>
                <span className='text-2xl font-bold text-white'>Skills & Expertise</span>
                <div className='mt-4 flex flex-wrap gap-3 font-normal text-white'>
                  {selectedMentor?.skills.map((skill) => (
                    <span
                      key={skill.skill_id}
                      className='inline-block rounded-full bg-(--primary) px-4 py-2 whitespace-nowrap'
                    >
                      {skill.skill_name}
                    </span>
                  ))}
                </div>
              </div>
              {/* Third component About */}
              <div className='rounded-xl bg-gray-800 px-7 py-7'>
                <span className='text-2xl font-bold text-white'>About</span>
                <div className='mt-4 text-gray-400'>{selectedMentor?.bio}</div>
              </div>
              {/* Fourth component Mentee Reviews */}
              <div className='rounded-xl bg-gray-800 px-7 py-7'>
                <span className='text-2xl font-bold text-white'>Mentee Reviews</span>
                <div className='mt-4 text-white'>
                  <Review name={review.name} star={review.star} avt={review.avt} review={review.review} />
                </div>
              </div>
            </div>
          </div>
          {/*---RIGHT SIDE BOOKING CARD --- */}
          <div className='h-full w-1/3 text-gray-400'>
            <div className='flex flex-col items-center justify-between gap-7 rounded-xl border border-(--primary) bg-gray-800 pb-7'>
              <div className='flex w-full border-b border-(--light-purple)'>
                <div className='h-[50px] w-1/2'>
                  <button
                    onClick={() => {
                      setPlanType("monthly");
                      if (monthlyPlans[0]) setSelectedPlanId(monthlyPlans[0].plan_id);
                    }}
                    disabled={monthlyPlans.length === 0}
                    className={`h-full w-full cursor-pointer rounded rounded-tl-xl transition-all ${planType === "monthly" ? "bg-(--primary) text-white shadow" : "text-gray-400 hover:text-white"}`}
                  >
                    Mentorship plans
                  </button>
                </div>
                <div className='h-[50px] w-1/2'>
                  <button
                    onClick={() => {
                      setPlanType("session");
                      if (sessionPlans[0]) setSelectedPlanId(sessionPlans[0].plan_id);
                    }}
                    disabled={sessionPlans.length === 0}
                    className={`h-full w-full cursor-pointer rounded rounded-tr-xl transition-all ${planType === "session" ? "bg-(--primary) text-white shadow" : "text-gray-400 hover:text-white"}`}
                  >
                    Session
                  </button>
                </div>
              </div>
              {planType === "monthly" &&
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                (displayPlan ? (
                  <div className='flex w-full flex-col gap-5 px-5'>
                    {activeList.length > 1 && (
                      <div className='flex w-full flex-wrap items-center justify-center gap-3'>
                        {monthlyPlans.map((plan) => (
                          <button
                            key={plan.plan_id}
                            onClick={() => {
                              setSelectedPlanId(plan.plan_id);
                            }}
                            className={`cursor-pointer rounded-full border px-5 py-1 text-sm text-[20px] transition-all ${
                              selectedPlanId === plan.plan_id
                                ? "border-(--green) bg-(--green)/10 font-bold text-(--green)"
                                : "border-gray-500 hover:border-gray-300"
                            }`}
                          >
                            {plan.plan_type}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className='flex w-full flex-col items-center justify-between gap-2 border-b border-gray-700 pb-5'>
                      <span>
                        <strong className='text-4xl text-white'>${displayPlan.plan_charge}</strong>/month
                      </span>
                      <span className='w-10/12 text-center text-sm italic'>{displayPlan.plan_description}</span>
                    </div>

                    <div className='flex flex-col gap-4 pl-2'>
                      {displayPlan.benefits?.map((benefit, index) => (
                        <span className='flex items-start gap-3 text-sm text-gray-300' key={index}>
                          <Check className='mt-0.5 h-4 w-4 shrink-0 text-(--green)' />
                          <span>{benefit}</span>
                        </span>
                      ))}
                    </div>

                    <button className='w-full rounded-lg bg-(--primary) py-3 font-bold text-white transition hover:bg-purple-700'>
                      Book Mentorship
                    </button>
                  </div>
                ) : (
                  <div className='flex h-40 items-center justify-center'>No monthly plans available</div>
                ))}
              {planType === "session" && (
                <div className='flex w-full flex-col items-center gap-3'>
                  <div className='w-10/12 rounded-2xl border border-(--green)'>
                    {activeList.map((p, index) => {
                      const isSelected = selectedPlanId === p.plan_id;
                      return (
                        <div
                          key={p.plan_id}
                          onClick={() => {
                            setSelectedPlanId(p.plan_id);
                          }}
                          className={`flex cursor-pointer gap-3 px-4 py-5 ${index !== 0 ? "border-t border-(--green)" : ""} `}
                        >
                          {/* Radio */}
                          <div
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${isSelected ? "border-(--green)" : "border-gray-500"} `}
                          >
                            {isSelected && <div className='h-2.5 w-2.5 rounded-full bg-(--green)' />}
                          </div>
                          {/* Infor session */}
                          <div className='flex flex-col gap-2'>
                            <p>
                              <strong className='text-white'>{p.plan_type}</strong> - {p.plan_description}
                            </p>
                            <p>
                              {p.sessions_duration} minutes, ${p.plan_charge} per person
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className='flex w-full justify-center'>
                    <button
                      className='flex w-10/12 cursor-pointer items-center justify-center rounded-lg bg-(--primary) py-3 text-white'
                      onClick={handleBookSession}
                    >
                      Book a session
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default MentorProfile;
