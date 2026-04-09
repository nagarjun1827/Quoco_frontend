import { Component, Inject, OnInit, PLATFORM_ID, ViewChild, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  attachment?: string;
  isSummary?: boolean;
}

interface TenderDocument {
  name: string;
  size: string;
  uploadDate: Date;
  type: string;
  mappedProject?: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  documents: TenderDocument[];
}

interface Project {
  name: string;
}

@Component({
  selector: 'app-tender-analyzer',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './tender-analyzer.component.html',
  styleUrl: './tender-analyzer.component.css'
})
export class TenderAnalyzerComponent implements OnInit {
  isDarkMode = false;
  isSidebarOpen = true;
  isDocSidebarOpen = true;

  sessions: ChatSession[] = [];
  activeSessionId: string | null = null;
  userInput: string = '';
  pendingAttachment: File | null = null;
  isAnalyzing = false;
  
  projects: Project[] = [];
  selectedProjectName: string = '';

  @ViewChild('feedContainer') private feedContainer!: ElementRef;

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
    }
    this.createNewChat();
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

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleDocSidebar() {
    this.isDocSidebarOpen = !this.isDocSidebarOpen;
  }

  get activeSession(): ChatSession | undefined {
    return this.sessions.find(s => s.id === this.activeSessionId);
  }

  createNewChat() {
    const newChat: ChatSession = {
      id: Math.random().toString(36).substring(2, 9),
      title: 'New Analysis ' + (this.sessions.length + 1),
      messages: [
        { sender: 'ai', text: 'Hello! I am the Quoco Tender Assistant. Please select a project above and upload your PDF tender document for analysis.' }
      ],
      documents: []
    };
    this.sessions.unshift(newChat);
    this.activeSessionId = newChat.id;
  }

  selectChat(id: string) {
    this.activeSessionId = id;
    this.scrollToBottom();
  }

  deleteChat(id: string, event: Event) {
    event.stopPropagation();
    this.sessions = this.sessions.filter(s => s.id !== id);
    if (this.activeSessionId === id) {
      this.activeSessionId = this.sessions.length > 0 ? this.sessions[0].id : null;
    }
    if (this.sessions.length === 0) {
      this.createNewChat();
    }
  }

  renameChat(id: string, event: Event) {
    event.stopPropagation();
    const session = this.sessions.find(s => s.id === id);
    if (session) {
      const newTitle = prompt('Enter new chat name:', session.title);
      if (newTitle && newTitle.trim()) {
        session.title = newTitle.trim();
      }
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && this.activeSession) {
      
      // Validation: Enforce PDF for Tenders
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        alert('Tender Analyser strictly accepts .pdf documents only.');
        event.target.value = '';
        return;
      }

      if (!this.selectedProjectName) {
        alert('Please select a project context before uploading tender files.');
        return;
      }

      this.isAnalyzing = true;
      
      // Add to sidebar
      this.activeSession.documents.push({
        name: file.name,
        size: this.formatFileSize(file.size),
        uploadDate: new Date(),
        type: 'application/pdf',
        mappedProject: this.selectedProjectName
      });

      // Add user message with attachment
      this.activeSession.messages.push({
        sender: 'user',
        text: `Uploaded: ${file.name} (Project: ${this.selectedProjectName})`,
        attachment: file.name
      });

      this.scrollToBottom();

      // Trigger Mock Summarization
      setTimeout(() => {
        this.isAnalyzing = false;
        const summary = `### PDF Analysis Summary: ${file.name}\n\n` +
          `**Project Context**: ${this.selectedProjectName}\n` +
          `**Total Scope**: High-fidelity structural audit for ${this.selectedProjectName}.\n` +
          `**Key Observations**:\n` +
          `1. Technical specifications align with ${this.selectedProjectName} regional directives.\n` +
          `2. Structural rebar estimated at 320 metric tons for this specific phase.\n` +
          `3. Completion deadline set for December 2026.\n\n` +
          `I have indexed this document under **${this.selectedProjectName}** in your Knowledge Base. You can now ask specific questions about its contents.`;

        this.activeSession?.messages.push({
          sender: 'ai',
          text: summary,
          isSummary: true
        });
        this.scrollToBottom();
      }, 2000);
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  sendMessage() {
    if (!this.userInput.trim() || !this.activeSession) return;

    const userPrompt = this.userInput;
    
    this.activeSession.messages.push({
      sender: 'user',
      text: userPrompt
    });

    this.userInput = '';
    this.scrollToBottom();

    // Mock AI Response
    setTimeout(() => {
      const response = `Based on the uploaded tender for ${this.selectedProjectName}, the structural estimate is consistent with recent phase 1 benchmarks. Check the M35 concrete grade availability at your ${this.selectedProjectName} site depot.`;
      
      this.activeSession?.messages.push({
        sender: 'ai',
        text: response
      });
      this.scrollToBottom();
    }, 1000);
  }

  scrollToBottom() {
    setTimeout(() => {
      try {
        if (this.feedContainer) {
          this.feedContainer.nativeElement.scrollTop = this.feedContainer.nativeElement.scrollHeight;
        }
      } catch (err) {}
    }, 50);
  }
}
