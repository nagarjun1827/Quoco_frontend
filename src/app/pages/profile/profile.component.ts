import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  isDarkMode = true;

  constructor(
    private fb: FormBuilder,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.profileForm = this.fb.group({
      email: [{value: '', disabled: true}, [Validators.required, Validators.email]],
      fullName: ['', Validators.required],
      phone: ['', Validators.required],
      companyName: ['', Validators.required],
      nob: ['', Validators.required],
      legalStatus: ['', Validators.required],
      estYear: ['', [Validators.required, Validators.min(1800), Validators.max(new Date().getFullYear())]],
      teamMember: ['', [Validators.required, Validators.min(1)]],
      companyCat: ['', Validators.required],
      address: ['', Validators.required],
      officeLocation: ['', Validators.required],
      gstNo: ['', Validators.required],
      panNo: ['', Validators.required],
    });
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const currentTheme = this.document.documentElement.getAttribute('data-theme');
      if (currentTheme === 'light') {
        this.isDarkMode = false;
      }
    }

    // Mock Data requested
    this.profileForm.patchValue({
      email: 'john.doe@acme.com',
      fullName: 'John Doe',
      phone: '+1234567890',
      companyName: 'Acme Corp',
      nob: 'Construction & Engineering',
      legalStatus: 'Partnership',
      estYear: 2015,
      teamMember: 50,
      companyCat: 'New York, USA',
      address: '123 Main St, New York, NY',
      officeLocation: 'New York, USA',
      gstNo: '18AABCT1234F1Z0',
      panNo: 'AAAPN1234A'
    });
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      this.document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      this.document.documentElement.setAttribute('data-theme', 'light');
    }
  }

  onSubmit() {
    if (this.profileForm.valid) {
      console.log('Profile updated successfully:', this.profileForm.getRawValue());
      alert('Profile details successfully updated!');
    } else {
      this.profileForm.markAllAsTouched();
    }
  }

  isInvalid(controlName: string): boolean {
    const control = this.profileForm.get(controlName);
    return control ? control.invalid && control.touched : false;
  }
}
