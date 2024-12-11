import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BlogPost } from '../models/blog.model';
import { BlogService } from '../services/blog.service';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-blog-form',
  templateUrl: './blog-form.component.html',
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
})
export class BlogFormComponent implements OnInit, OnChanges {
  @Input() blog: BlogPost | null = null;
  @Output() formSubmit = new EventEmitter<void>();
  @Output() cancelEdit = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();


  blogForm!: FormGroup;
  isEditMode = false;
  isNewMode=false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly blogService: BlogService,
    private readonly toastr: ToastrService
  ) {}

  // Getters for easy form control access
  get usernameControl() {
    return this.blogForm.get('username')!;
  }
  get textControl() {
    return this.blogForm.get('text')!;
  }

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Reinitialize form when input changes
    if (changes['blog']) {
      this.initForm();
    }
  }

  private initForm(): void {
    this.isEditMode = !!this.blog;
    

    this.blogForm = this.fb.group({
      id: [this.blog?.id || null],
      username: [
        this.blog?.username || '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      text: [
        this.blog?.text || '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(500),
        ],
      ],
    });
  }

  submitForm(): void {
    if (this.blogForm.invalid) {
      this.markFormGroupTouched(this.blogForm);
      return;
    }

    const blogData: BlogPost = this.blogForm.value;

    const submitObservable: Observable<any> = this.isEditMode
      ? this.blogService.update(blogData)
      : this.blogService.add(blogData);

    submitObservable.subscribe({
      next: () => {
        const message = this.isEditMode
          ? 'Blog updated successfully'
          : 'Blog created successfully';

        this.toastr.success(message, 'Success');
        this.formSubmit.emit();
        this.resetForm();
      },
      error: (err) => {
        console.error(
          this.isEditMode ? 'Error updating blog:' : 'Error creating blog:',
          err
        );
        this.toastr.error(
          this.isEditMode ? 'Failed to update blog' : 'Failed to create blog',
          'Error'
        );
      },
    });
  }

  // Utility method to mark all controls as touched
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Reset form after submission
  private resetForm(): void {
    this.blogForm.reset();
    this.isEditMode = false;
    this.blog = null;
  }

  // Cancel editing
  cancelEditMode(): void {
    this.resetForm();
    this.cancelEdit.emit();
  }
}
