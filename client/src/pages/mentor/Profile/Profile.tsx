import { getSkillsList } from "@/apis/catalog.api";
import { useAuthStore } from "@/store/useAuthStore";
import type { resultsSkills } from "@/types";
import { mapMentorToProfileData } from "@/utils/mentor.utils";
import { ChevronDown, Plus, Save, Trash2, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FaGithub, FaLinkedin, FaTwitter, FaBehance, FaDribbble, FaKaggle } from "react-icons/fa";
import { COUNTRIES } from "@/constants/countries";
import { TIMEZONES } from "@/constants/timezones";
import { LANGUAGES } from "@/constants/languages";
import { updateMentorProfile } from "@/apis/mentor.api";
import { uploadAvatar } from "@/apis/user.api";
export default function Profile() {
  const user = useAuthStore((state) => state.mentor);
  const [formData, setFormData] = useState(() => mapMentorToProfileData(user));

  //-----STATE SKILL LIST-----
  const [availableSkills, setAvailableSkills] = useState<resultsSkills[]>([]);
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const SOCIAL_PLATFORMS = [
    { name: "GitHub", icon: <FaGithub size={20} />, color: "text-gray-200" },
    { name: "LinkedIn", icon: <FaLinkedin size={20} />, color: "text-[#0A66C2]" },
    { name: "Twitter", icon: <FaTwitter size={20} />, color: "text-[#1DA1F2]" },
    { name: "Behance", icon: <FaBehance size={20} />, color: "text-[#1769FF]" },
    { name: "Dribbble", icon: <FaDribbble size={20} />, color: "text-[#EA4C89]" },
    { name: "Kaggle", icon: <FaKaggle size={20} />, color: "text-[#20BEFF]" },
  ];

  useEffect(() => {
    const fetchSkills = async () => {
      setIsLoadingSkills(true);
      try {
        const resSkills = await getSkillsList(1, 100);
        if (resSkills.success && resSkills.data?.skills) {
          const rawSkills = resSkills.data.skills;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mappedSkills = rawSkills.map((item: any) => ({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            id: item.skill_id ?? item.id,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            name: item.skill_name ?? item.name,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            mentor_count: item.mentor_count,
            type: "skill",
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            super_category_id: item.super_category_id,
          }));
          setAvailableSkills(mappedSkills);
        }
      } catch (error) {
        console.log("Fail to load skills", error);
      } finally {
        setIsLoadingSkills(false);
      }
    };
    void fetchSkills();
  }, []);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCompanyChange = (index: number, field: "companyName" | "jobTitleName", value: string) => {
    const newCompanies = [...formData.companies];
    newCompanies[index][field] = value;
    setFormData((prev) => ({ ...prev, companies: newCompanies }));
  };

  const addCompany = () => {
    setFormData((prev) => ({
      ...prev,
      companies: [...prev.companies, { companyName: "", jobTitleName: "" }],
    }));
  };

  const removeCompany = (index: number) => {
    const newCompanies = formData.companies.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, companies: newCompanies }));
  };

  const handleAddSkill = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(e.target.value);
    if (!selectedId) return;

    if (!formData.skillIds.includes(selectedId)) {
      setFormData((prev) => ({
        ...prev,
        skillIds: [...prev.skillIds, selectedId],
      }));
    }

    e.target.value = "";
  };
  const removeSkill = (idToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      skillIds: prev.skillIds.filter((id) => id !== idToRemove),
    }));
  };

  const handleSocialChange = (platformName: string, newLink: string) => {
    setFormData((prev) => {
      const newSocialLinks = [...prev.socialLinks];

      const existingIndex = newSocialLinks.findIndex(
        (item) => item.platform.toLowerCase() === platformName.toLowerCase()
      );

      if (existingIndex >= 0) {
        newSocialLinks[existingIndex].link = newLink;
      } else {
        newSocialLinks.push({ platform: platformName, link: newLink });
      }

      return { ...prev, socialLinks: newSocialLinks };
    });
  };

  const handleAddLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    if (!lang) return;

    // Kiểm tra trùng lặp
    if (!formData.languages.includes(lang)) {
      setFormData((prev) => ({
        ...prev,
        languages: [...prev.languages, lang],
      }));
    }

    // Reset dropdown
    e.target.value = "";
  };
  const removeLanguage = (langToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((l) => l !== langToRemove),
    }));
  };
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setAvatarFile(file);

      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        avatarUrl: previewUrl,
      }));
    }
  };

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async () => {
    try {
      if (avatarFile) {
        const uploadRes = await uploadAvatar(avatarFile);

        if (!uploadRes.success) {
          alert("Error upload avatar:" + uploadRes.message);
          return;
        }
      }
      const payload = { ...formData };

      if (!user?.user_id) return;

      const res = await updateMentorProfile(user.user_id, payload);

      if (res.success) {
        alert("Update successfully");
      } else {
        alert("Error: " + res.message);
      }
    } catch (error) {
      console.log("Update Error: ", error);
      alert("Update fail");
    }
  };
  return (
    <>
      <div className='flex min-h-screen w-full justify-center bg-(--secondary) p-10 text-gray-300'>
        <div className='flex w-full max-w-4xl flex-col gap-6'>
          {/* HEADER */}
          <h1 className='mb-2 text-3xl font-bold text-white'>Edit Profile</h1>
          {/* BASIC INFO */}
          <div className='rounded-xl border border-gray-700 bg-gray-800 p-6'>
            <div className='flex items-start gap-6'>
              {/* Avatar Upload */}

              <div className='flex flex-col items-center gap-3'>
                <input
                  type='file'
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  className='hidden'
                  accept='image/*'
                />
                <div className='h-24 w-24 rounded-full bg-linear-to-tr from-purple-500 to-blue-500 p-1'>
                  <img
                    src={formData.avatarUrl}
                    alt='Avatar'
                    className='h-full w-full rounded-full border-4 border-[#1E212D] object-cover'
                  />
                </div>
                <button
                  onClick={handleTriggerUpload} // Bấm nút này -> Kích hoạt input ẩn ở trên
                  className='flex items-center gap-1 text-sm font-medium text-purple-400 transition-colors hover:text-purple-300'
                >
                  <Upload size={14} /> Change Photo
                </button>
              </div>

              {/* Fields */}
              <div className='grid flex-1 grid-cols-2 gap-5'>
                <div className='col-span-1'>
                  <label className='mb-1 block text-xs font-semibold text-gray-400 uppercase'>First Name</label>
                  <input
                    type='text'
                    name='firstName'
                    value={formData.firstName}
                    onChange={handleChange}
                    className='w-full rounded-lg border border-gray-700 bg-gray-700 px-4 py-3 text-white transition outline-none focus:border-(--light-purple)'
                  />
                </div>
                <div className='col-span-1'>
                  <label className='mb-1 block text-xs font-semibold text-gray-400 uppercase'>Last Name</label>
                  <input
                    type='text'
                    name='lastName'
                    value={formData.lastName}
                    onChange={handleChange}
                    className='w-full rounded-lg border border-gray-700 bg-gray-700 px-4 py-3 text-white transition outline-none focus:border-(--light-purple)'
                  />
                </div>
                <div className='relative col-span-1'>
                  <label className='mb-1 block text-xs font-semibold text-gray-400 uppercase'>Country</label>

                  <select
                    name='country'
                    value={formData.country}
                    onChange={handleChange}
                    className='w-full cursor-pointer appearance-none rounded-lg border border-gray-800 bg-gray-700 px-4 py-3 text-white transition outline-none focus:border-(--light-purple)'
                  >
                    <option value='' className='text-gray-400'>
                      {formData.country !== "" ? formData.country : "Select a country"}
                    </option>

                    {/* Map danh sách từ file constants */}
                    {COUNTRIES.map((country) => (
                      <option key={country} value={country} className='bg-gray-700'>
                        {country}
                      </option>
                    ))}
                  </select>

                  {/* Icon mũi tên */}
                  <div className='pointer-events-none absolute top-[35px] right-4 text-gray-500'>
                    <ChevronDown size={16} />
                  </div>
                </div>
                <div className='relative col-span-1'>
                  <label className='mb-1 block text-xs font-semibold text-gray-400 uppercase'>Country</label>

                  <select
                    name='timezone'
                    value={formData.timezone}
                    onChange={handleChange}
                    className='w-full cursor-pointer appearance-none rounded-lg border border-gray-800 bg-gray-700 px-4 py-3 text-white transition outline-none focus:border-(--light-purple)'
                  >
                    <option value='' className='text-gray-400'>
                      {formData.timezone !== "" ? formData.timezone : "Select a timezone"}
                    </option>

                    {/* Map danh sách từ file constants */}
                    {TIMEZONES.map((timezone) => (
                      <option key={timezone} value={timezone} className='bg-gray-700'>
                        {timezone}
                      </option>
                    ))}
                  </select>

                  {/* Icon mũi tên */}
                  <div className='pointer-events-none absolute top-[35px] right-4 text-gray-500'>
                    <ChevronDown size={16} />
                  </div>
                </div>
                <div className='relative col-span-1'>
                  <label className='mb-1 block text-xs font-semibold text-gray-400 uppercase'>Gender</label>
                  <select
                    name='sex'
                    value={formData.sex}
                    onChange={handleChange}
                    className='w-full cursor-pointer appearance-none rounded-lg border border-gray-800 bg-gray-700 px-4 py-3 text-white transition outline-none focus:border-(--light-purple)'
                  >
                    <option value='Male'>Male</option>
                    <option value='Female'>Female</option>
                    <option value='Other'>Other</option>
                  </select>
                  <div className='pointer-events-none absolute top-[35px] right-4 text-gray-500'>
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* About and Skill */}
          <div className='flex flex-col gap-6 rounded-xl border border-gray-700 bg-gray-800 p-6'>
            <h2 className='text-xl font-bold text-white'>About Me</h2>

            <div>
              <label className='mb-1 block text-xs font-semibold text-gray-400 uppercase'>Bio</label>
              <textarea
                name='bio'
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className='w-full resize-none rounded-lg border border-gray-800 bg-gray-700 px-4 py-3 text-white transition outline-none focus:border-(--light-purple)'
              />
            </div>
            <div className='grid grid-cols-1 gap-5'>
              <div className='flex flex-col gap-2'>
                <label className='mb-1 block text-xs font-semibold text-gray-400 uppercase'>Languages</label>

                {/* 1. Danh sách ngôn ngữ đã chọn (Tags) */}
                <div className='mb-1 flex flex-wrap gap-2'>
                  {formData.languages.map((lang, index) => (
                    <span
                      key={index}
                      className='flex items-center gap-2 rounded-full border border-blue-500/50 bg-blue-600/20 px-3 py-1 text-sm text-blue-200'
                    >
                      {lang}
                      <X
                        size={14}
                        className='cursor-pointer hover:text-white'
                        onClick={() => {
                          removeLanguage(lang);
                        }}
                      />
                    </span>
                  ))}
                </div>

                {/* 2. Dropdown chọn ngôn ngữ */}
                <div className='relative'>
                  <select
                    onChange={handleAddLanguage}
                    className='w-full cursor-pointer appearance-none rounded-lg border border-gray-800 bg-gray-700 px-4 py-3 text-gray-300 transition outline-none focus:border-(--light-purple)'
                  >
                    <option value='' className='text-gray-300'>
                      + Add a language...
                    </option>

                    {LANGUAGES.filter((lang) => !formData.languages.includes(lang)) // Ẩn ngôn ngữ đã chọn
                      .map((lang) => (
                        <option key={lang} value={lang} className='bg-gray-700'>
                          {lang}
                        </option>
                      ))}
                  </select>

                  {/* Mũi tên */}
                  <div className='pointer-events-none absolute top-[15px] right-4 text-gray-500'>
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>
            </div>

            {/* SKILLS SECTION */}
            <div className='flex flex-col gap-2'>
              <label className='mb-1 block text-xs font-semibold text-gray-400 uppercase'>Skills & Expertise</label>

              {/* 1. Hiển thị Tags đã chọn */}
              <div className='mb-2 flex flex-wrap gap-2'>
                {formData.skillIds.map((skillId) => {
                  const skill = availableSkills.find((s) => s.id === skillId);
                  const fallbackName = user?.skills.find((s) => s.skill_id === skillId)?.skill_name;

                  return (
                    <span
                      key={skillId}
                      className='flex items-center gap-2 rounded-full border border-purple-500/50 bg-purple-600/20 px-3 py-1 text-sm text-purple-200'
                    >
                      {skill?.name ?? fallbackName ?? `Skill #${String(skillId)}`}
                      <X
                        size={14}
                        className='cursor-pointer hover:text-white'
                        onClick={() => {
                          removeSkill(skillId);
                        }}
                      />
                    </span>
                  );
                })}
              </div>

              {/* 2. Dropdown chọn Skill mới */}
              <div className='relative'>
                <select
                  onChange={handleAddSkill}
                  className='w-full cursor-pointer appearance-none rounded-lg border border-gray-800 bg-gray-700 px-4 py-3 text-gray-300 transition outline-none focus:border-(--light-purple)'
                  disabled={isLoadingSkills}
                >
                  <option value=''>{isLoadingSkills ? "Loading skills..." : "+ Add a skill..."}</option>

                  {availableSkills
                    .filter((s) => !formData.skillIds.includes(s.id))
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((skill) => (
                      <option key={skill.id} value={skill.id} className='bg-gray-700 text-white'>
                        {skill.name}
                      </option>
                    ))}
                </select>

                <div className='pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-gray-500'>
                  <Plus size={16} className='rotate-45' /> {/* Giả lập mũi tên */}
                </div>
              </div>

              <p className='mt-1 text-[10px] text-gray-500'>Can't find your skill? Contact support to request it.</p>
            </div>
          </div>

          {/* EXPERIENCE (COMPANIES) */}
          <div className='flex flex-col gap-6 rounded-lg border border-gray-700 bg-gray-800 p-6'>
            <div className='flex items-center justify-between'>
              <h2 className='text-xl font-bold text-white'>Work Experience</h2>
              <button
                onClick={addCompany}
                className='flex items-center gap-2 rounded-lg bg-(--primary) px-3 py-1.5 text-sm text-white transition'
              >
                <Plus size={16} /> Add Position
              </button>
            </div>

            <div className='flex flex-col gap-4'>
              {formData.companies.map((company, index) => (
                <div key={index} className='flex items-start gap-4 rounded-lg bg-gray-700 p-4'>
                  <div className='flex-1'>
                    <label className='mb-1 block text-[10px] font-semibold text-gray-500 uppercase'>Company Name</label>
                    <input
                      type='text'
                      value={company.companyName}
                      onChange={(e) => {
                        handleCompanyChange(index, "companyName", e.target.value);
                      }}
                      className='w-full border-b border-gray-700 bg-gray-700 pb-1 text-white transition outline-none focus:border-(--light-purple)'
                      placeholder='e.g. Google'
                    />
                  </div>
                  <div className='flex-1'>
                    <label className='mb-1 block text-[10px] font-semibold text-gray-500 uppercase'>Job Title</label>
                    <input
                      value={company.jobTitleName}
                      onChange={(e) => {
                        handleCompanyChange(index, "jobTitleName", e.target.value);
                      }}
                      className='w-full border-b border-gray-700 bg-transparent pb-1 text-white transition outline-none focus:border-(--light-purple)'
                      placeholder='e.g. Senior Engineer'
                    />
                  </div>
                  {formData.companies.length > 1 && (
                    <button
                      onClick={() => {
                        removeCompany(index);
                      }}
                      className='mt-4 p-1 text-gray-500 transition hover:text-red-400'
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* BANKING INFO */}
          <div className='flex flex-col gap-6 rounded-xl border border-gray-700 bg-gray-800 p-6'>
            <h2 className='text-xl font-bold text-white'>Banking Details</h2>
            <div className='grid grid-cols-2 gap-5'>
              <div className='col-span-1'>
                <label className='mb-1 block text-xs font-semibold text-gray-400 uppercase'>Bank Name</label>
                <input
                  name='bankName'
                  value={formData.bankName}
                  onChange={handleChange}
                  className='w-full rounded-lg border border-gray-700 bg-gray-700 px-4 py-3 text-white transition outline-none focus:border-(--light-purple)'
                />
              </div>
              <div className='col-span-1'>
                <label className='mb-1 block text-xs font-semibold text-gray-400 uppercase'>Bank Branch</label>
                <input
                  name='bankBranch'
                  value={formData.bankBranch}
                  onChange={handleChange}
                  className='w-full rounded-lg border border-gray-800 bg-gray-700 px-4 py-3 text-white transition outline-none focus:border-(--light-purple)'
                />
              </div>
              <div className='col-span-1'>
                <label className='mb-1 block text-xs font-semibold text-gray-400 uppercase'>Account Holder Name</label>
                <input
                  name='accountHolderName'
                  value={formData.accountHolderName}
                  onChange={handleChange}
                  className='w-full rounded-lg border border-gray-800 bg-gray-700 px-4 py-3 text-white transition outline-none focus:border-(--light-purple)'
                />
              </div>
              <div className='col-span-1'>
                <label className='mb-1 block text-xs font-semibold text-gray-400 uppercase'>Account Number</label>
                <input
                  name='accountNumber'
                  value={formData.accountNumber}
                  onChange={handleChange}
                  className='w-full rounded-lg border border-gray-800 bg-gray-700 px-4 py-3 text-white transition outline-none focus:border-(--light-purple)'
                />
              </div>
              <div className='col-span-2'>
                <label className='mb-1 block text-xs font-semibold text-gray-400 uppercase'>SWIFT / BIC Code</label>
                <input
                  name='swiftCode'
                  value={formData.swiftCode}
                  onChange={handleChange}
                  className='w-full rounded-lg border border-gray-800 bg-gray-700 px-4 py-3 text-white transition outline-none focus:border-(--light-purple)'
                />
              </div>
            </div>
          </div>

          {/* SOCIAL LINKS */}
          <div className='flex flex-col gap-6 rounded-xl border border-gray-700 bg-gray-800 p-6'>
            <h2 className='text-xl font-bold text-white'>Social Links</h2>
            <div className='flex flex-col gap-4'>
              {SOCIAL_PLATFORMS.map((platform) => {
                // Tìm link hiện tại trong state (nếu có) để hiển thị vào input
                const currentLink =
                  formData.socialLinks.find((s) => s.platform.toLowerCase() === platform.name.toLowerCase())?.link ??
                  "";

                return (
                  <div key={platform.name} className='flex items-center gap-3'>
                    {/* Ô vuông chứa Logo bên trái */}
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-gray-800 bg-gray-700 ${platform.color}`}
                    >
                      {platform.icon}
                    </div>

                    {/* Input bên phải */}
                    <div className='flex-1'>
                      <label className='mb-1 block text-[10px] font-semibold text-gray-500 uppercase'>
                        {platform.name} URL
                      </label>
                      <input
                        value={currentLink}
                        onChange={(e) => {
                          handleSocialChange(platform.name, e.target.value);
                        }}
                        className='w-full rounded-lg border border-gray-800 bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-600 transition outline-none focus:border-(--light-purple)'
                        placeholder={`https://${platform.name.toLowerCase()}.com/...`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* FOOTER BUTTONS */}
          <div className='flex items-center justify-between pt-4 pb-10'>
            <button className='rounded-lg bg-red-500/10 px-6 py-2.5 font-semibold text-red-500 transition hover:bg-red-500/20'>
              Delete Account
            </button>
            <div className='flex gap-4'>
              <button className='rounded-lg border border-gray-600 px-6 py-2.5 font-semibold text-gray-300 transition hover:bg-gray-800'>
                Cancel
              </button>
              <button
                onClick={void handleSave}
                className='flex items-center gap-2 rounded-lg bg-(--primary) px-8 py-2.5 font-bold text-white shadow-lg shadow-purple-900/50 transition hover:bg-purple-700'
              >
                <Save size={18} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
