import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';

export interface Project {
  name: string;
  status: string;
  location: string;
  budget: string;
  startDate: string;
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css'
})
export class ProjectsComponent implements OnInit {
  isDarkMode = false;
  isModalOpen = false;
  projectForm: FormGroup;
  statusFilter = 'All';

  projects: Project[] = [];

  constructor(
    private fb: FormBuilder,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.projectForm = this.fb.group({
      projectName: ['', Validators.required],
      status: ['Select status', Validators.required],
      location: ['', Validators.required],
      budget: ['', Validators.required],
      startDate: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const currentTheme = this.document.documentElement.getAttribute('data-theme');
      if (currentTheme === 'dark') {
        this.isDarkMode = true;
      }
      this.loadProjects();
    }
  }

  loadProjects() {
    const stored = localStorage.getItem('quoco_projects');
    if (stored) {
      this.projects = JSON.parse(stored);
    } else {
      // Default Initial Projects
      this.projects = [
        { name: 'Downtown Highrise Phase 1', status: 'Active', location: 'New York, NY', budget: '$12,500,000', startDate: '2026-05-01' },
        { name: 'Riverfront Commercial Plz', status: 'Pending', location: 'Chicago, IL', budget: '$4,200,000', startDate: '2026-06-15' },
        { name: 'Valley Logistics Hub', status: 'Completed', location: 'Phoenix, AZ', budget: '$8,950,000', startDate: '2025-01-10' },
      ];
      this.saveProjects();
    }
  }

  saveProjects() {
    localStorage.setItem('quoco_projects', JSON.stringify(this.projects));
  }

  get filteredProjects() {
    if (this.statusFilter === 'All') return this.projects;
    return this.projects.filter(p => p.status === this.statusFilter);
  }

  openModal() {
    this.isModalOpen = true;
    this.projectForm.reset({ status: 'Select status' });
    if (isPlatformBrowser(this.platformId)) {
      this.document.body.style.overflow = 'hidden';
    }
  }

  closeModal() {
    this.isModalOpen = false;
    if (isPlatformBrowser(this.platformId)) {
      this.document.body.style.overflow = '';
    }
  }

  changeFilter(event: any) {
    this.statusFilter = event.target.value;
  }

  onSubmit() {
    if (this.projectForm.valid && this.projectForm.value.status !== 'Select status') {
      const newProject: Project = {
        name: this.projectForm.value.projectName,
        status: this.projectForm.value.status,
        location: this.projectForm.value.location,
        budget: this.projectForm.value.budget,
        startDate: this.projectForm.value.startDate
      };
      this.projects.unshift(newProject);
      this.saveProjects();
      this.closeModal();
    } else {
      this.projectForm.markAllAsTouched();
    }
  }

  isInvalid(controlName: string): boolean {
    const control = this.projectForm.get(controlName);
    return control ? control.invalid && control.touched : false;
  }
}
