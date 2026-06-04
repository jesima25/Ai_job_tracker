from dataclasses import dataclass
from typing import Optional
from datetime import datetime

@dataclass
class Job:
    id: Optional[int]
    company: str
    role: str
    status: str = 'Applied'
    location: str = ''
    salary: str = ''
    job_url: str = ''
    notes: str = ''
    created_at: str = ''

    def to_dict(self):
        return {
            'id': self.id,
            'company': self.company,
            'role': self.role,
            'status': self.status,
            'location': self.location,
            'salary': self.salary,
            'job_url': self.job_url,
            'notes': self.notes,
            'created_at': self.created_at
        }

    @staticmethod
    def from_dict(data: dict):
        return Job(
            id=data.get('id'),
            company=data.get('company', ''),
            role=data.get('role', ''),
            status=data.get('status', 'Applied'),
            location=data.get('location', ''),
            salary=data.get('salary', ''),
            job_url=data.get('job_url', ''),
            notes=data.get('notes', ''),
            created_at=data.get('created_at', datetime.now().isoformat())
        )

    VALID_STATUSES = ['Applied', 'Interview', 'Offer', 'Rejected']
