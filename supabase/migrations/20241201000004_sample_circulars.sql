-- Migration: Additional Sample Circulars with Attachments
-- Description: Add more comprehensive sample circulars with attachments for testing
-- Created: 2024-12-01

-- Extend the circulars table to include attachments column if it doesn't already exist
-- (It should already exist from the initial schema)

-- Clear existing sample circulars (remove the placeholder ones)
delete from circulars where published_by = '00000000-0000-0000-0000-000000000000';

-- Add comprehensive sample circulars (you'll need real user UUIDs)
-- Note: Replace the UUID below with actual user IDs from your auth.users table

-- Sample circular with attachments
insert into circulars (
    title, 
    reference_number, 
    category, 
    priority, 
    issue_date, 
    content, 
    attachments,
    published_by, 
    requires_acknowledgment
) values 
(
    'Winter Navigation Safety Guidelines 2024-2025',
    'SAF-WIN-2024-001',
    'safety',
    'urgent',
    '2024-11-15',
    '<p>With the winter navigation season approaching, all vessels must adhere to enhanced safety protocols when operating in icy conditions.</p>
     <p><strong>Key Requirements:</strong></p>
     <ul>
       <li>Ice detection equipment must be operational</li>
       <li>Emergency procedures must be reviewed with all crew</li>
       <li>Fuel reserves must be increased by 25% for ice-breaking operations</li>
       <li>Communication equipment redundancy must be verified</li>
     </ul>
     <p>Please review the attached winter operations manual and confirm acknowledgment of these requirements within 24 hours.</p>',
    '[
        {"filename": "Winter_Operations_Manual_2024.pdf", "url": "/attachments/winter_manual_2024.pdf", "size": 2048000},
        {"filename": "Ice_Navigation_Checklist.docx", "url": "/attachments/ice_checklist.docx", "size": 45120},
        {"filename": "Emergency_Contacts_2024.xlsx", "url": "/attachments/emergency_contacts.xlsx", "size": 8192}
    ]'::jsonb,
    '00000000-0000-0000-0000-000000000000',
    true
),

(
    'Port State Control Inspection Checklist Update',
    'PSC-UPD-2024-012',
    'operation',
    'high',
    '2024-11-20',
    '<p>Updated Port State Control inspection checklist effective December 1, 2024.</p>
     <p>Changes include:</p>
     <ul>
       <li>New requirement for vessel-wide cybersecurity protocols</li>
       <li>Enhanced environmental compliance documentation</li>
       <li>Updated crew competency verification forms</li>
       <li>Revised safety management system guidelines</li>
     </ul>
     <p>All vessels must be inspected using the updated checklist starting next month. Masters and Chief Engineers are required to review and acknowledge this update.</p>',
    '[
        {"filename": "PSC_Inspection_Checklist_v2024.2.pdf", "url": "/attachments/psc_checklist_v2024.2.pdf", "size": 1536000}
    ]'::jsonb,
    '00000000-0000-0000-0000-000000000000',
    true
),

(
    'IT Security Incident Response Protocol',
    'SEC-IT-2024-008',
    'administrative',
    'urgent',
    '2024-11-25',
    '<p><strong>URGENT:</strong> Immediate action required regarding vessel cybersecurity.</p>
     <p>We have identified potential vulnerabilities in vessel communication systems that require immediate attention:</p>
     <ol>
       <li>Update all vessel software to latest versions</li>
       <li>Change default passwords on all electronic devices</li>
       <li>Enable two-factor authentication on critical systems</li>
       <li>Disconnect non-essential devices from vessel network</li>
     </ol>
     <p>This is a mandatory security update. Compliance must be confirmed within 48 hours.</p>',
    '[
        {"filename": "Security_Update_Instructions.pdf", "url": "/attachments/security_update.pdf", "size": 512000},
        {"filename": "Vulnerability_Assessment_Report.pdf", "url": "/attachments/vulnerability_report.pdf", "size": 3072000},
        {"filename": "Software_Update_Checklist.xlsx", "url": "/attachments/software_checklist.xlsx", "size": 24576}
    ]'::jsonb,
    '00000000-0000-0000-0000-000000000000',
    true
),

(
    'Crew Training Schedule Quarter 1 2025',
    'TNG-Q1-2025-004',
    'crew_change',
    'medium',
    '2024-12-01',
    '<p>Training schedule for Q1 2025 has been finalized and published.</p>
     <p><strong>Key Training Programs:</strong></p>
     <ul>
       <li>Advanced Fire Fighting - January 15-17</li>
       <li>GMDSS Radio Operations - February 2-4</li>
       <li>Lead Auditor Course - February 10-14</li>
       <li>ECDIS Type-Specific Training - March 5-7</li>
     </ul>
     <p>Please register for required training sessions through the attached scheduling form. Early registration is encouraged.</p>',
    '[
        {"filename": "Training_Schedule_Q1_2025.pdf", "url": "/attachments/training_schedule_q1_2025.pdf", "size": 1024000},
        {"filename": "Registration_Form.docx", "url": "/attachments/training_registration.docx", "size": 16384}
    ]'::jsonb,
    '00000000-0000-0000-0000-000000000000',
    false
),

(
    'Environmental Monitoring Equipment Calibration',
    'ENV-CAL-2024-019',
    'operation',
    'normal',
    '2024-11-28',
    '<p>Annual calibration of environmental monitoring equipment is scheduled for all vessels.</p>
     <p>Please ensure:</p>
     <ul>
       <li>All emission monitoring devices are operational</li>
       <li>Oil content monitors are functioning correctly</li>
       <li>Ballast water management systems are calibrated</li>
       <li>Certificates of calibration are current</li>
     </ul>
     <p>The attached equipment checklist should be completed and returned to operations department by the end of January.</p>',
    '[
        {"filename": "Equipment_Calibration_Checklist.pdf", "url": "/attachments/calibration_checklist.pdf", "size": 256000},
        {"filename": "Calibration_Procedures_Manual.pdf", "url": "/attachments/calibration_procedures.pdf", "size": 512000}
    ]'::jsonb,
    '00000000-0000-0000-0000-000000000000',
    false
);



