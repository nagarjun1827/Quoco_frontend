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
}

interface Project {
  name: string;
}

@Component({
  selector: 'app-boq-knowledge-base',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './boq-knowledge-base.component.html',
  styleUrl: './boq-knowledge-base.component.css'
})
export class BoQKnowledgeBaseComponent implements OnInit {
  isDarkMode = false;
  knowledgeBaseFiles: BoqFile[] = [];
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
    const kbStored = localStorage.getItem('boq_knowledge_base_files');
    if (kbStored) this.knowledgeBaseFiles = JSON.parse(kbStored);
  }

  saveKnowledgeBaseFiles() {
    localStorage.setItem('boq_knowledge_base_files', JSON.stringify(this.knowledgeBaseFiles));
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

  onKnowledgeBaseUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const files = Array.from(target.files);
      
      // Validation: Enforce XLSX for BoQ
      const invalidFiles = files.filter(f => this.getFileType(f.name) !== 'xlsx');
      if (invalidFiles.length > 0) {
        alert('Invalid format detected. BoQ Knowledge Base only accepts .xlsx or .xls files.');
        target.value = '';
        return;
      }

      if (!this.selectedProjectName) {
        alert('Please select a project to map these BoQs to.');
        return;
      }

      files.forEach(file => {
        this.knowledgeBaseFiles.unshift({
          id: Date.now() + '_' + Math.random().toString(36).slice(2),
          name: file.name,
          project: this.selectedProjectName,
          size: this.formatFileSize(file.size),
          uploadedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          type: this.getFileType(file.name)
        });
      });
      this.saveKnowledgeBaseFiles();
      target.value = '';
    }
  }

  deleteKnowledgeBaseFile(id: string) {
    if (confirm('Are you sure you want to delete this archive?')) {
      this.knowledgeBaseFiles = this.knowledgeBaseFiles.filter(f => f.id !== id);
      this.saveKnowledgeBaseFiles();
    }
  }

  viewFile(file: BoqFile) {
    this.viewingFile = file;
  }

  closeViewer() {
    this.viewingFile = null;
  }
}
