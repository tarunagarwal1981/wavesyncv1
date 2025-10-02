import { SignoffCategory } from './types';

export interface DefaultChecklistItem {
  text: string;
  category: SignoffCategory;
  orderIndex: number;
  isRequired: boolean;
  description?: string;
}

export const DEFAULT_CHECKLIST_ITEMS: DefaultChecklistItem[] = [
  // Administrative Tasks
  {
    text: "Submit crew change notification to port agent",
    category: 'administrative',
    orderIndex: 1,
    isRequired: true,
    description: "Ensure port agent has been notified at least 48 hours before sign-off"
  },
  {
    text: "Complete vessel departure notification",
    category: 'administrative', 
    orderIndex: 2,
    isRequired: true,
    description: "Submit departure notification to port authority"
  },
  {
    text: "Update arrival/departure logbook",
    category: 'administrative',
    orderIndex: 3,
    isRequired: true
  },
  {
    text: "Submit crew list updates to immigration",
    category: 'administrative',
    orderIndex: 4,
    isRequired: true
  },
  {
    text: "Arrange transportation from vessel",
    category: 'administrative',
    orderIndex: 5,
    isRequired: true
  },

  // Handover Tasks  
  {
    text: "Brief relieving officer on vessel operations",
    category: 'handover',
    orderIndex: 1,
    isRequired: true,
    description: "Comprehensive handover including standing orders and safety procedures"
  },
  {
    text: "Complete technical handover checklist",
    category: 'handover',
    orderIndex: 2,
    isRequired: true
  },
  {
    text: "Hand over vessel keys and access codes",
    category: 'handover', 
    orderIndex: 3,
    isRequired: true
  },
  {
    text: "Brief emergency procedures and contacts",
    category: 'handover',
    orderIndex: 4,
    isRequired: true
  },
  {
    text: "Update vessel standing orders document",
    category: 'handover',
    orderIndex: 5,
    isRequired: false
  },

  // Documentation
  {
    text: "Complete discharge certificate",
    category: 'documentation',
    orderIndex: 1,
    isRequired: true,
    description: "Obtain discharge certificate from Master"
  },
  {
    text: "Sign vessel logbook entries",
    category: 'documentation',
    orderIndex: 2,
    isRequired: true
  },
  {
    text: "Complete seaman's book endorsement", 
    category: 'documentation',
    orderIndex: 3,
    isRequired: true
  },
  {
    text: "Exchange certificates with relieving officer",
    category: 'documentation',
    orderIndex: 4,
    isRequired: true
  },
  {
    text: "Update insurance and personal documents",
    category: 'documentation',
    orderIndex: 5,
    isRequired: false
  },

  // Financial Settlement
  {
    text: "Calculate final salary payment",
    category: 'financial',
    orderIndex: 1,
    isRequired: true,
    description: "Verify final salary calculations including overtime"
  },
  {
    text: "Settle any outstanding advances",
    category: 'financial',
    orderIndex: 2,
    isRequired: true
  },
  {
    text: "Complete expense declarations",
    category: 'financial',
    orderIndex: 3,
    isRequired: true
  },
  {
    text: "Arrange sign-off bonus payment",
    category: 'financial',
    orderIndex: 4,
    isRequired: false
  },
  {
    text: "Verify travel allowance calculations",
    category: 'financial',
    orderIndex: 5,
    isRequired: true
  },

  // Personal Preparation
  {
    text: "Pack personal belongings securely",
    category: 'personal_preparation',
    orderIndex: 1,
    isRequired: true,
    description: "Ensure all personal items are properly packed for transport"
  },
  {
    text: "Complete personal incident reporting",
    category: 'personal_preparation',
    orderIndex: 2,
    isRequired: true
  },
  {
    text: "Update emergency contact information",
    category: 'personal_preparation',
    orderIndex: 3,
    isRequired: false
  },
  {
    text: "Prepare travel documentation",
    category: 'personal_preparation', 
    orderIndex: 4,
    isRequired: true
  },
  {
    text: "Complete crew feedback form",
    category: 'personal_preparation',
    orderIndex: 5,
    isRequired: false
  }
];

export const TIMELINE_MILESTONES = [
  {
    title: "Checklist Activation",
    description: "Sign-off checklist becomes available",
    daysBeforeSignoff: 30,
    type: 'milestone' as const,
    priority: 'medium' as const
  },
  {
    title: "Financial Settlement Due",
    description: "All financial matters should be finalized",
    daysBeforeSignoff: 7,
    type: 'deadline' as const,
    priority: 'high' as const
  },
  {
    title: "Documentation Preparation",
    description: "Complete all document preparation",
    daysBeforeSignoff: 5,
    type: 'milestone' as const,
    priority: 'high' as const
  },
  {
    title: "Final Handover Briefing",
    description: "Conduct final handover to relieving officer",
    daysBeforeSignoff: 2,
    type: 'deadline' as const,
    priority: 'high' as const
  },
  {
    title: "Personal Preparation Complete",
    description: "All personal preparation tasks completed",
    daysBeforeSignoff: 1,
    type: 'milestone' as const,
    priority: 'high' as const
  }
];
