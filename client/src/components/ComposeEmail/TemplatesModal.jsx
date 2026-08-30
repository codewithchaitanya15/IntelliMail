import React from 'react';
import { X, Sparkles, Briefcase, TrendingUp, UserCheck, Calendar, ShieldCheck, Rocket, Wrench, Coffee } from 'lucide-react';

export const EMAIL_TEMPLATES = [
  {
    id: 'cold-outreach',
    title: 'Cold Outreach & Business Pitch',
    icon: Briefcase,
    category: 'Sales & Growth',
    description: 'High-converting strategic introduction with clear value proposition and CTA.',
    subject: 'Partnership Opportunity: Accelerating [Target Goal] with [Your Solution]',
    body: `Dear [Prospect Name],

I hope this email finds you well.

I have been following [Company Name]'s recent milestones, particularly your work in [Key Area/Initiative], and wanted to reach out regarding a strategic initiative that could drive immediate value for your team.

At [Your Company], we partner with industry leaders to streamline [Core Problem/Process]. By integrating our solutions, our partners have consistently achieved:
• [Metric 1]: E.g., 35% reduction in operational turnaround time.
• [Metric 2]: E.g., 2.5x increase in client response engagement.
• [Metric 3]: Seamless setup with zero disruption to active workflows.

Proposed Next Steps:
Would you be open to a brief 10-minute introductory conversation next Tuesday or Thursday to see if this is a strategic fit for [Company Name]? 

Best regards,

[Your Name]
[Your Title] | [Your Company]
[Your Phone / LinkedIn]`,
  },
  {
    id: 'investor-update',
    title: 'Investor & Stakeholder Monthly Update',
    icon: TrendingUp,
    category: 'Executive & Strategy',
    description: 'Clean, structured monthly report with highlights, metrics, and asks.',
    subject: '[Company Name] Executive Update: [Month Year] Progress & Key Metrics',
    body: `Dear Investors & Stakeholders,

I am pleased to share our executive performance update for [Current Month]. We have achieved strong momentum across our core product, revenue, and customer acquisition targets.

Executive Summary & Key Highlights:
• Revenue & Growth: [Metric: e.g. $120k ARR (+18% MoM)]
• Product Milestones: Shipped [Feature 1] and deployed [Feature 2] to production.
• Customer Success: Onboarded [Number] new enterprise accounts with 99.4% retention.

Current Focus & Near-Term Priorities:
1. Scaling enterprise pipeline and accelerating conversion cycles.
2. Expanding API integrations to support key strategic partners.
3. Hiring 2 senior software engineers for platform scalability.

Where We Could Use Your Help (Asks):
• Introductions to prospective design partners in [Target Industry].
• Candidate recommendations for our Lead Platform Engineer role.

Thank you as always for your continued partnership and guidance.

Best regards,

[Your Name]
CEO & Founder | [Company Name]`,
  },
  {
    id: 'job-followup',
    title: 'Job Application & Interview Follow-up',
    icon: UserCheck,
    category: 'Career & Talent',
    description: 'Polite, impactful post-interview appreciation with reinforced value.',
    subject: 'Thank You: [Your Name] - [Position Title] Interview Follow-up',
    body: `Dear [Interviewer Name],

Thank you so much for taking the time to speak with me today regarding the [Position Title] role at [Company Name].

I truly enjoyed learning more about your team's vision, particularly your upcoming roadmap for [Specific Topic Discussed]. Our conversation reinforced my enthusiasm for the opportunity, and I am confident that my experience in [Key Skill/Domain] will allow me to make an immediate, meaningful impact on your team.

As requested, I have attached [any requested work sample/portfolio link] for your review. Please let me know if you need any additional information or references from my end.

Looking forward to hearing from you regarding the next steps in the process!

Warm regards,

[Your Name]
[Your Phone Number] | [Your Portfolio/LinkedIn Link]`,
  },
  {
    id: 'meeting-reschedule',
    title: 'Meeting Reschedule Request',
    icon: Calendar,
    category: 'Operations',
    description: 'Courteous notice requesting a new time slot with instant alternatives.',
    subject: 'Reschedule Request: [Original Meeting Topic] - [Your Name] / [Recipient Name]',
    body: `Hi [Recipient Name],

I hope you are having a productive week.

Due to an unforeseen scheduling conflict on my calendar, I will regrettably need to reschedule our upcoming meeting originally scheduled for [Original Date & Time].

I sincerely apologize for any inconvenience this may cause. I remain very eager to connect and have outlined several alternative times when I am completely free:
• [Option 1]: [Date] at [Time & Timezone]
• [Option 2]: [Date] at [Time & Timezone]
• [Option 3]: [Date] at [Time & Timezone]

Please let me know which of these options works best for your schedule, and I will immediately update our calendar invitation.

Thank you very much for your understanding!

Best regards,

[Your Name]`,
  },
  {
    id: 'contract-negotiation',
    title: 'Contract & Pricing Negotiation',
    icon: ShieldCheck,
    category: 'Finance & Legal',
    description: 'Diplomatic proposal addressing term revisions and mutual value.',
    subject: 'Proposal Review & Terms Discussion: [Project/Contract Name]',
    body: `Dear [Partner/Vendor Name],

Thank you for providing the initial agreement draft and pricing breakdown for [Project/Service Name].

Our executive team has completed a thorough review of the specifications. We are very excited about moving forward together, and we would like to propose a few minor adjustments to ensure the contract aligns with our operational budget and delivery timelines:

Key Items for Alignment:
1. Pricing & Billing Terms: Proposed adjustment to [e.g. Net 45 / Volume discount of 10%].
2. Scope & Milestones: Clarification on delivery timeline for Phase 1 deliverables.
3. SLA & Support Coverage: Ensuring standard 24/7 critical issue turnaround.

We believe these adjustments create a balanced, win-win foundation for a long-term partnership. Would you be available for a brief call tomorrow afternoon to finalize these terms?

Sincerely,

[Your Name]
[Your Title] | [Your Company]`,
  },
  {
    id: 'product-announcement',
    title: 'Feature Release & Product Announcement',
    icon: Rocket,
    category: 'Marketing',
    description: 'Exciting announcement highlighting new features and immediate benefits.',
    subject: '🚀 Introducing [Feature/Product Name]: Supercharge your [Benefit] today!',
    body: `Hi [Customer Name / Team],

We are thrilled to officially announce the launch of **[New Feature/Product Name]**!

Built directly from your feedback, this update introduces powerful new capabilities designed to help you [Primary User Benefit]:

What's New:
• ⚡ [Feature Highlight 1]: [Brief 1-sentence value explanation].
• 🎯 [Feature Highlight 2]: [Brief 1-sentence value explanation].
• 🔒 [Feature Highlight 3]: [Brief 1-sentence value explanation].

How to Get Started:
You can start using [Feature Name] right now directly in your account dashboard. Check out our quick 2-minute walkthrough guide here: [Link].

We would love to hear your thoughts and feedback as you explore this release!

Warm regards,

The [Company Name] Product Team`,
  },
];

export const TemplatesModal = ({ isOpen, onClose, onSelectTemplate }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                AI Email Templates Library
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select a professionally curated template to prefill your draft instantly.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Templates Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {EMAIL_TEMPLATES.map((tmpl) => {
            const Icon = tmpl.icon;
            return (
              <div
                key={tmpl.id}
                onClick={() => {
                  onSelectTemplate(tmpl);
                  onClose();
                }}
                className="group p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-transparent hover:bg-sky-50/70 dark:hover:bg-sky-950/30 hover:border-sky-400 dark:hover:border-sky-500 transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-md hover:shadow-sky-500/10 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-slate-100/80 dark:bg-slate-800 text-sky-600 dark:text-sky-400 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                        {tmpl.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-sky-100/60 dark:group-hover:bg-sky-900/40 group-hover:text-sky-700 dark:group-hover:text-sky-300 transition-colors">
                      {tmpl.category}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
                    {tmpl.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span className="truncate max-w-[200px] text-slate-600 dark:text-slate-300">
                    {tmpl.subject}
                  </span>
                  <span className="text-sky-600 dark:text-sky-400 font-semibold group-hover:underline flex-shrink-0">
                    Use Template →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
