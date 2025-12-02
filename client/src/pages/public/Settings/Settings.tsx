import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Save, X, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { getUserSettings, updateUserSettings, changePassword } from "@/apis/settings.api";
import type { UserSettings, SocialLink } from "@/types/settings.type";
import path from "@/constants/path";

// Custom social icons as SVG components
const LinkedInIcon = () => (
  <svg className='h-5 w-5 text-[#0A66C2]' fill='currentColor' viewBox='0 0 24 24'>
    <path d='M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z' />
  </svg>
);

const GitHubIcon = () => (
  <svg className='h-5 w-5 text-white' fill='currentColor' viewBox='0 0 24 24'>
    <path d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z' />
  </svg>
);

const TwitterIcon = () => (
  <svg className='h-5 w-5 text-[#1DA1F2]' fill='currentColor' viewBox='0 0 24 24'>
    <path d='M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z' />
  </svg>
);

const FacebookIcon = () => (
  <svg className='h-5 w-5 text-[#1877F2]' fill='currentColor' viewBox='0 0 24 24'>
    <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
  </svg>
);

export default function Settings() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
    { platform: "LinkedIn", link: "" },
    { platform: "GitHub", link: "" },
    { platform: "Twitter", link: "" },
    { platform: "Facebook", link: "" },
  ]);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  // Original data for cancel
  const [originalData, setOriginalData] = useState<UserSettings | null>(null);

  useEffect(() => {
    if (!user) {
      void navigate(path.LOGIN);
      return;
    }

    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await getUserSettings();
        if (response.success && response.data) {
          const data = response.data;
          setFirstName(data.first_name);
          setLastName(data.last_name);
          setEmail(data.email);
          setUsername(data.username ?? "");
          setHeadline(data.headline ?? "");
          setBio(data.bio ?? "");

          // Populate social links
          const newSocialLinks: SocialLink[] = [
            { platform: "LinkedIn", link: "" },
            { platform: "GitHub", link: "" },
            { platform: "Twitter", link: "" },
            { platform: "Facebook", link: "" },
          ];
          data.social_links.forEach((link) => {
            const index = newSocialLinks.findIndex((s) => s.platform.toLowerCase() === link.platform.toLowerCase());
            if (index !== -1) {
              newSocialLinks[index].link = link.link;
            }
          });
          setSocialLinks(newSocialLinks);
          setOriginalData(data);
        }
      } catch (err) {
        setError("Failed to load settings");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    void fetchSettings();
  }, [user, navigate]);

  const handleSocialLinkChange = (platform: string, value: string) => {
    setSocialLinks((prev) => prev.map((link) => (link.platform === platform ? { ...link, link: value } : link)));
  };

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "linkedin":
        return <LinkedInIcon />;
      case "github":
        return <GitHubIcon />;
      case "twitter":
        return <TwitterIcon />;
      case "facebook":
        return <FacebookIcon />;
      default:
        return null;
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await updateUserSettings({
        firstName,
        lastName,
        username: username || undefined,
        headline: user?.role === "Mentor" ? headline : undefined,
        bio: user?.role === "Mentor" ? bio : undefined,
        socialLinks: socialLinks.filter((link) => link.link.trim() !== ""),
      });

      if (response.success) {
        setSuccess("Settings saved successfully!");
        // Refresh original data
        const refreshResponse = await getUserSettings();
        if (refreshResponse.success && refreshResponse.data) {
          setOriginalData(refreshResponse.data);
        }
      } else {
        setError(response.message || "Failed to save settings");
      }
    } catch (err) {
      setError("Failed to save settings");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (originalData) {
      setFirstName(originalData.first_name);
      setLastName(originalData.last_name);
      setEmail(originalData.email);
      setUsername(originalData.username ?? "");
      setHeadline(originalData.headline ?? "");
      setBio(originalData.bio ?? "");

      const newSocialLinks: SocialLink[] = [
        { platform: "LinkedIn", link: "" },
        { platform: "GitHub", link: "" },
        { platform: "Twitter", link: "" },
        { platform: "Facebook", link: "" },
      ];
      originalData.social_links.forEach((link) => {
        const index = newSocialLinks.findIndex((s) => s.platform.toLowerCase() === link.platform.toLowerCase());
        if (index !== -1) {
          newSocialLinks[index].link = link.link;
        }
      });
      setSocialLinks(newSocialLinks);
    }
    setError(null);
    setSuccess(null);
  };

  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    try {
      setChangingPassword(true);
      const response = await changePassword({ currentPassword, newPassword });

      if (response.success) {
        setPasswordSuccess("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordError(response.message || "Failed to change password");
      }
    } catch (err) {
      setPasswordError("Failed to change password");
      console.error(err);
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-(--bg-grey)'>
        <Loader2 className='h-8 w-8 animate-spin text-(--primary)' />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-(--bg-grey) px-4 py-8'>
      <div className='mx-auto max-w-4xl'>
        <h1 className='mb-8 text-3xl font-bold text-white'>Account Settings</h1>

        {/* Success/Error Messages */}
        {error && <div className='mb-4 rounded-lg border border-red-500 bg-red-500/20 p-4 text-red-400'>{error}</div>}
        {success && (
          <div className='mb-4 rounded-lg border border-green-500 bg-green-500/20 p-4 text-green-400'>{success}</div>
        )}

        {/* Basic Information */}
        <div className='mb-6 rounded-xl bg-(--secondary) p-6'>
          <h2 className='mb-6 text-xl font-semibold text-white'>Basic Information</h2>

          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <div>
              <label className='mb-2 block text-sm text-gray-400'>First Name</label>
              <input
                type='text'
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                }}
                className='w-full rounded-lg border border-gray-600 bg-(--dark-grey) px-4 py-3 text-white focus:border-(--primary) focus:outline-none'
                placeholder='Enter first name'
              />
            </div>

            <div>
              <label className='mb-2 block text-sm text-gray-400'>Last Name</label>
              <input
                type='text'
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                }}
                className='w-full rounded-lg border border-gray-600 bg-(--dark-grey) px-4 py-3 text-white focus:border-(--primary) focus:outline-none'
                placeholder='Enter last name'
              />
            </div>

            <div>
              <label className='mb-2 block text-sm text-gray-400'>Email</label>
              <input
                type='email'
                value={email}
                disabled
                className='w-full cursor-not-allowed rounded-lg border border-gray-600 bg-(--dark-grey) px-4 py-3 text-gray-500'
                placeholder='Email cannot be changed'
              />
              <p className='mt-1 text-xs text-gray-500'>Email cannot be changed</p>
            </div>

            <div>
              <label className='mb-2 block text-sm text-gray-400'>Username</label>
              <input
                type='text'
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                }}
                className='w-full rounded-lg border border-gray-600 bg-(--dark-grey) px-4 py-3 text-white focus:border-(--primary) focus:outline-none'
                placeholder='Enter username'
              />
            </div>
          </div>
        </div>

        {/* Professional Information - Only for Mentors */}
        {user?.role === "Mentor" && (
          <div className='mb-6 rounded-xl bg-(--secondary) p-6'>
            <h2 className='mb-6 text-xl font-semibold text-white'>Professional Information</h2>

            <div className='mb-6'>
              <label className='mb-2 block text-sm text-gray-400'>Professional Title / Specialty</label>
              <input
                type='text'
                value={headline}
                onChange={(e) => {
                  setHeadline(e.target.value);
                }}
                className='w-full rounded-lg border border-gray-600 bg-(--dark-grey) px-4 py-3 text-white focus:border-(--primary) focus:outline-none'
                placeholder='e.g., Senior Software Engineer, Product Manager'
              />
            </div>

            <div>
              <label className='mb-2 block text-sm text-gray-400'>About Me</label>
              <textarea
                value={bio}
                onChange={(e) => {
                  setBio(e.target.value);
                }}
                rows={5}
                className='w-full resize-none rounded-lg border border-gray-600 bg-(--dark-grey) px-4 py-3 text-white focus:border-(--primary) focus:outline-none'
                placeholder='Tell us about yourself, your experience, and what you can help mentees with...'
              />
            </div>
          </div>
        )}

        {/* Social Links */}
        <div className='mb-6 rounded-xl bg-(--secondary) p-6'>
          <h2 className='mb-6 text-xl font-semibold text-white'>Social Links</h2>

          <div className='space-y-4'>
            {socialLinks.map((link) => (
              <div key={link.platform} className='flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-(--dark-grey)'>
                  {getSocialIcon(link.platform)}
                </div>
                <input
                  type='url'
                  value={link.link}
                  onChange={(e) => {
                    handleSocialLinkChange(link.platform, e.target.value);
                  }}
                  className='flex-1 rounded-lg border border-gray-600 bg-(--dark-grey) px-4 py-3 text-white focus:border-(--primary) focus:outline-none'
                  placeholder={`Enter your ${link.platform} URL`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Change Password */}
        <div className='mb-6 rounded-xl bg-(--secondary) p-6'>
          <h2 className='mb-6 text-xl font-semibold text-white'>Change Password</h2>

          {passwordError && (
            <div className='mb-4 rounded-lg border border-red-500 bg-red-500/20 p-3 text-sm text-red-400'>
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className='mb-4 rounded-lg border border-green-500 bg-green-500/20 p-3 text-sm text-green-400'>
              {passwordSuccess}
            </div>
          )}

          <div className='space-y-4'>
            <div>
              <label className='mb-2 block text-sm text-gray-400'>Current Password</label>
              <div className='relative'>
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                  }}
                  className='w-full rounded-lg border border-gray-600 bg-(--dark-grey) px-4 py-3 pr-12 text-white focus:border-(--primary) focus:outline-none'
                  placeholder='Enter current password'
                />
                <button
                  type='button'
                  onClick={() => {
                    setShowCurrentPassword(!showCurrentPassword);
                  }}
                  className='absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-white'
                >
                  {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className='mb-2 block text-sm text-gray-400'>New Password</label>
              <div className='relative'>
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                  }}
                  className='w-full rounded-lg border border-gray-600 bg-(--dark-grey) px-4 py-3 pr-12 text-white focus:border-(--primary) focus:outline-none'
                  placeholder='Enter new password'
                />
                <button
                  type='button'
                  onClick={() => {
                    setShowNewPassword(!showNewPassword);
                  }}
                  className='absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-white'
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className='mb-2 block text-sm text-gray-400'>Confirm New Password</label>
              <div className='relative'>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                  }}
                  className='w-full rounded-lg border border-gray-600 bg-(--dark-grey) px-4 py-3 pr-12 text-white focus:border-(--primary) focus:outline-none'
                  placeholder='Confirm new password'
                />
                <button
                  type='button'
                  onClick={() => {
                    setShowConfirmPassword(!showConfirmPassword);
                  }}
                  className='absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-white'
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type='button'
              onClick={() => {
                void handleChangePassword();
              }}
              disabled={changingPassword}
              className='mt-4 flex items-center gap-2 rounded-lg bg-(--primary) px-6 py-3 font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50'
            >
              {changingPassword && <Loader2 className='h-4 w-4 animate-spin' />}
              Change Password
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex justify-end gap-4'>
          <button
            type='button'
            onClick={handleCancel}
            className='flex items-center gap-2 rounded-lg bg-(--dark-grey) px-6 py-3 font-medium text-white transition hover:brightness-110'
          >
            <X size={20} />
            Cancel
          </button>
          <button
            type='button'
            onClick={() => {
              void handleSave();
            }}
            disabled={saving}
            className='flex items-center gap-2 rounded-lg bg-(--primary) px-6 py-3 font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {saving ? <Loader2 className='h-5 w-5 animate-spin' /> : <Save size={20} />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
