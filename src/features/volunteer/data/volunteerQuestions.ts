export interface Question {
  id: string;
  label: string;
  type: "text" | "email" | "select" | "textarea" | "checkbox" | "radio";
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  description?: string;
}

export const volunteerQuestions: Question[] = [
  {
    id: "fullName",
    label: "Full Name",
    type: "text",
    required: true,
    placeholder: "Enter your full name",
  },
  {
    id: "email",
    label: "Email Address",
    type: "email",
    required: true,
    placeholder: "Enter your email address",
  },
  {
    id: "phone",
    label: "Phone Number",
    type: "text",
    required: false,
    placeholder: "Enter your phone number (optional)",
  },
  {
    id: "availability",
    label: "Availability",
    type: "select",
    required: true,
    options: [
      { value: "", label: "Select your availability" },
      { value: "fullTime", label: "Full-time (40+ hours/week)" },
      { value: "partTime", label: "Part-time (20-39 hours/week)" },
      { value: "limited", label: "Limited (5-19 hours/week)" },
      { value: "occasional", label: "Occasional (less than 5 hours/week)" },
    ],
    description: "How much time can you dedicate to volunteering?",
  },
  {
    id: "skills",
    label: "Technical Skills",
    type: "select",
    required: true,
    options: [
      { value: "", label: "Select your primary technical skill" },
      { value: "sysadmin", label: "System Administration" },
      { value: "networking", label: "Networking" },
      { value: "webDev", label: "Web Development" },
      { value: "devops", label: "DevOps" },
      { value: "security", label: "Security" },
      { value: "documentation", label: "Documentation" },
      { value: "qa", label: "Quality Assurance" },
      { value: "other", label: "Other" },
    ],
    description: "What is your primary technical skill?",
  },
  {
    id: "otherSkills",
    label: "Other Skills",
    type: "textarea",
    required: false,
    placeholder: "Please list any other relevant skills or expertise",
    description:
      "List any other skills that might be relevant to your volunteer work",
  },
  {
    id: "experience",
    label: "Linux Experience",
    type: "select",
    required: true,
    options: [
      { value: "", label: "Select your experience level" },
      { value: "beginner", label: "Beginner (less than 1 year)" },
      { value: "intermediate", label: "Intermediate (1-3 years)" },
      { value: "advanced", label: "Advanced (3-5 years)" },
      { value: "expert", label: "Expert (5+ years)" },
    ],
    description: "How would you rate your experience with Linux?",
  },
  {
    id: "distros",
    label: "Familiar Distributions",
    type: "textarea",
    required: false,
    placeholder: "List Linux distributions you are familiar with",
    description: "Which Linux distributions are you most familiar with?",
  },
  {
    id: "interests",
    label: "Areas of Interest",
    type: "checkbox",
    required: true,
    options: [
      { value: "mirrorMaintenance", label: "Mirror Maintenance" },
      { value: "webDevelopment", label: "Web Development" },
      { value: "documentation", label: "Documentation" },
      { value: "communitySupport", label: "Community Support" },
      { value: "testing", label: "Testing and QA" },
      { value: "security", label: "Security" },
    ],
    description: "Which areas are you interested in volunteering for?",
  },
  {
    id: "motivation",
    label: "Motivation",
    type: "textarea",
    required: true,
    placeholder: "Tell us why you want to volunteer with APTlantis",
    description: "Why do you want to volunteer with APTlantis?",
  },
  {
    id: "commitment",
    label: "Commitment Period",
    type: "radio",
    required: true,
    options: [
      { value: "shortTerm", label: "Short-term (1-3 months)" },
      { value: "mediumTerm", label: "Medium-term (3-6 months)" },
      { value: "longTerm", label: "Long-term (6+ months)" },
    ],
    description: "How long do you expect to be able to volunteer?",
  },
  {
    id: "previousExperience",
    label: "Previous Volunteer Experience",
    type: "textarea",
    required: false,
    placeholder: "Describe any previous volunteer experience",
    description:
      "Have you volunteered for other open-source projects before? If so, please describe your experience.",
  },
  {
    id: "additionalInfo",
    label: "Additional Information",
    type: "textarea",
    required: false,
    placeholder: "Any other information you would like to share",
    description: "Is there anything else you would like to share with us?",
  },
];
