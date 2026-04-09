import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export interface AppPreference {
  id: string;
  label: string;
  description: string;
  value: string;
  options: string[];
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  isDarkMode = false;

  // Password fields
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  showCurrentPw = false;
  showNewPw = false;
  showConfirmPw = false;
  passwordMessage = '';
  passwordSuccess = false;

  // Company Profile Form
  profileForm: FormGroup;
  profileSaved = false;

  // Notifications
  notifications: NotificationSetting[] = [
    { id: 'email', label: 'Email Notifications', description: 'Receive email updates about your projects', enabled: true },
    { id: 'push', label: 'Push Notifications', description: 'Get notified about important updates in-app', enabled: true },
    { id: 'sms', label: 'SMS Notifications', description: 'Receive text messages for urgent updates', enabled: false },
    { id: 'marketing', label: 'Marketing Emails', description: 'Receive emails about new features and tips', enabled: false },
    { id: 'boq', label: 'BoQ Estimation Alerts', description: 'Get notified when AI estimation jobs complete', enabled: true },
    { id: 'tender', label: 'Tender Deadline Reminders', description: 'Alerts for upcoming tender submission deadlines', enabled: true },
  ];

  // Preferences
  preferences: AppPreference[] = [
    { id: 'currency', label: 'Default Currency', description: 'Currency used for all cost estimates', value: 'ZAR (R)', options: ['ZAR (R)', 'USD ($)', 'EUR (€)', 'GBP (£)', 'AED (د.إ)'] },
    { id: 'region', label: 'Default Region', description: 'Region used for material price lookups', value: 'Gauteng', options: ['Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Limpopo'] },
    { id: 'dateformat', label: 'Date Format', description: 'How dates are displayed across the platform', value: 'DD MMM YYYY', options: ['DD MMM YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'] },
  ];

  // Danger zone
  showDeleteConfirm = false;

  constructor(
    private fb: FormBuilder,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.profileForm = this.fb.group({
      email: [{ value: 'john.doe@acme.com', disabled: true }, [Validators.required, Validators.email]],
      fullName: ['John Doe', Validators.required],
      phone: ['+1234567890', Validators.required],
      companyName: ['Acme Corp', Validators.required],
      nob: ['Construction & Engineering', Validators.required],
      legalStatus: ['Partnership', Validators.required],
      estYear: [2015, [Validators.required, Validators.min(1800), Validators.max(new Date().getFullYear())]],
      teamMember: [50, [Validators.required, Validators.min(1)]],
      companyCat: ['New York, USA', Validators.required],
      address: ['123 Main St, New York, NY', Validators.required],
      officeLocation: ['New York, USA', Validators.required],
      gstNo: ['18AABCT1234F1Z0', Validators.required],
      panNo: ['AAAPN1234A', Validators.required],
    });
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const currentTheme = this.document.documentElement.getAttribute('data-theme');
      this.isDarkMode = currentTheme === 'dark';
      this.loadSavedSettings();
    }
  }

  loadSavedSettings() {
    const saved = localStorage.getItem('quoco_notifications');
    if (saved) {
      const parsed: { id: string; enabled: boolean }[] = JSON.parse(saved);
      parsed.forEach(s => {
        const n = this.notifications.find(n => n.id === s.id);
        if (n) n.enabled = s.enabled;
      });
    }
    const savedPrefs = localStorage.getItem('quoco_preferences');
    if (savedPrefs) {
      const parsed: { id: string; value: string }[] = JSON.parse(savedPrefs);
      parsed.forEach(p => {
        const pref = this.preferences.find(pr => pr.id === p.id);
        if (pref) pref.value = p.value;
      });
    }
    const savedProfile = localStorage.getItem('quoco_profile');
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      this.profileForm.patchValue(parsed);
    }
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');
  }

  toggleNotification(notif: NotificationSetting) {
    notif.enabled = !notif.enabled;
    localStorage.setItem('quoco_notifications', JSON.stringify(
      this.notifications.map(n => ({ id: n.id, enabled: n.enabled }))
    ));
  }

  savePreferences() {
    localStorage.setItem('quoco_preferences', JSON.stringify(
      this.preferences.map(p => ({ id: p.id, value: p.value }))
    ));
  }

  onSaveProfile() {
    if (this.profileForm.valid) {
      localStorage.setItem('quoco_profile', JSON.stringify(this.profileForm.getRawValue()));
      this.profileSaved = true;
      setTimeout(() => { this.profileSaved = false; }, 3500);
    } else {
      this.profileForm.markAllAsTouched();
    }
  }

  isProfileInvalid(controlName: string): boolean {
    const control = this.profileForm.get(controlName);
    return control ? control.invalid && control.touched : false;
  }

  updatePassword() {
    this.passwordMessage = '';
    if (!this.currentPassword) {
      this.passwordMessage = 'Please enter your current password.';
      this.passwordSuccess = false;
      return;
    }
    if (this.newPassword.length < 8) {
      this.passwordMessage = 'New password must be at least 8 characters.';
      this.passwordSuccess = false;
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.passwordMessage = 'New passwords do not match.';
      this.passwordSuccess = false;
      return;
    }
    this.passwordMessage = 'Password updated successfully.';
    this.passwordSuccess = true;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    setTimeout(() => { this.passwordMessage = ''; }, 4000);
  }

  confirmDeleteAccount() {
    this.showDeleteConfirm = true;
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
  }

  deleteAccount() {
    alert('Account deletion is disabled in this demo.');
    this.showDeleteConfirm = false;
  }
}
