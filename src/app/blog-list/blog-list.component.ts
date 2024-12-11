import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlogService } from '../services/blog.service';
import { BlogPost } from '../models/blog.model';
import { ToastrService } from 'ngx-toastr';
import { BlogFormComponent } from '../blog-form/blog-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatCardModule} from '@angular/material/card';

@Component({
  standalone:true,
  selector: 'app-blog-list',
  templateUrl: './blog-list.component.html',
  styleUrl:'./blog-list.component.css',
  imports:[CommonModule,FormsModule,BlogFormComponent,MatCardModule]
})
export class BlogListComponent implements OnInit {
  blogs: BlogPost[] = [];
  selectedBlogForEdit: BlogPost | null = null;
  isFormVisible = false;
  filteredBlogs: BlogPost[] = [];
  searchTerm: string = '';

  constructor(
    private readonly blogService: BlogService,
    private readonly toastr: ToastrService // Add ToastrService for notifications
  ) {}

  ngOnInit(): void {
    this.loadBlogs();
  }

  private loadBlogs(): void {
    this.blogService.getAll().subscribe({
      next: (data) => {
        this.blogs = data;
        // Sort blogs by date in descending order
        this.blogs.sort((a, b) => 
          new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
        );
      }
    });
  }

  filterBlogs(): void {
    if (this.searchTerm) {
    this.filteredBlogs = this.blogs.filter(blog =>
    blog.username.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    } else {
    this.filteredBlogs = this.blogs;
    }
    }
  startNewBlog(): void {
    this.selectedBlogForEdit = null;
    this.isFormVisible = true;

    }
  startEditBlog(blog: BlogPost): void {
    // Clone the blog to avoid direct mutation
    this.selectedBlogForEdit = { ...blog };
    this.isFormVisible = true;

  }

  onFormSubmit(): void {
    // Reset selected blog and refresh the list
    this.selectedBlogForEdit = null;
    this.loadBlogs();
    this.toastr.success('Blog list updated successfully', 'Success');
  }
  onCancelEdit(): void {
    this.selectedBlogForEdit = null;
    this.isFormVisible = false;

    }

  deleteBlog(id: number): void {
    if (confirm('Are you sure you want to delete this blog?')) {
      this.blogService.delete(id).subscribe({
        next: () => {
          this.toastr.success('Blog deleted successfully', 'Success');
          this.loadBlogs();
        },
        error: (err) => {
          console.error('Error deleting blog:', err);
          this.toastr.error('Failed to delete blog', 'Error');
        }
      });
    }
  }
}
