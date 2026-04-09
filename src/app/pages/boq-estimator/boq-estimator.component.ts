import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface BoqFile {
  id: string;
  name: string;
  project: string;
  size: string;
  uploadedAt: string;
  type: 'pdf' | 'xlsx' | 'other';
  status: 'queued' | 'in_progress' | 'success' | 'failed';
}

interface Project {
  name: string;
}

@Component({
  selector: 'app-boq-estimator',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './boq-estimator.component.html',
  styleUrl: './boq-estimator.component.css'
})
export class BoqEstimatorComponent implements OnInit {
  isDarkMode = false;
  estimatorFiles: BoqFile[] = [];
  viewingFile: BoqFile | null = null;
  
  projects: Project[] = [];
  selectedProjectName: string = '';

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const currentTheme = this.document.documentElement.getAttribute('data-theme');
      if (currentTheme === 'dark') {
        this.isDarkMode = true;
      }
      this.loadProjects();
      this.loadStoredFiles();
    }
  }

  loadProjects() {
    const stored = localStorage.getItem('quoco_projects');
    if (stored) {
      this.projects = JSON.parse(stored);
      if (this.projects.length > 0) {
        this.selectedProjectName = this.projects[0].name;
      }
    }
  }

  loadStoredFiles() {
    const estStored = localStorage.getItem('boq_estimator_files');
    if (estStored) this.estimatorFiles = JSON.parse(estStored);
  }

  saveEstimatorFiles() {
    localStorage.setItem('boq_estimator_files', JSON.stringify(this.estimatorFiles));
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  getFileType(name: string): 'pdf' | 'xlsx' | 'other' {
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (ext === 'xlsx' || ext === 'xls') return 'xlsx';
    return 'other';
  }

  onPremiumUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      
      // Validation: Enforce XLSX for BoQ
      if (this.getFileType(file.name) !== 'xlsx') {
        alert('Invalid format. The AI Estimator only accepts .xlsx or .xls files.');
        target.value = '';
        return;
      }

      if (!this.selectedProjectName) {
        alert('Please select a project to map this estimation request to.');
        return;
      }
      
      this.estimatorFiles.unshift({
        id: Date.now() + '_' + Math.random().toString(36).slice(2),
        name: file.name,
        project: this.selectedProjectName,
        size: this.formatFileSize(file.size),
        uploadedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        type: this.getFileType(file.name),
        status: 'queued'
      });
      this.saveEstimatorFiles();
      target.value = '';
    }
  }

  deleteEstimatorFile(id: string) {
    if (confirm('Remove this estimation request?')) {
      this.estimatorFiles = this.estimatorFiles.filter(f => f.id !== id);
      this.saveEstimatorFiles();
    }
  }

  cycleStatus(file: BoqFile) {
    const cycle: BoqFile['status'][] = ['queued', 'in_progress', 'success', 'failed'];
    const idx = cycle.indexOf(file.status);
    file.status = cycle[(idx + 1) % cycle.length];
    this.saveEstimatorFiles();
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'queued':      return 'In Queue';
      case 'in_progress': return 'In Progress';
      case 'success':     return 'Success';
      case 'failed':      return 'Failed';
      default:            return 'In Queue';
    }
  }

  viewFile(file: BoqFile) {
    this.viewingFile = file;
  }

  closeViewer() {
    this.viewingFile = null;
  }
}
