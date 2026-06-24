import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { IPost, IPostFormData, PostStatusType } from '../../../core/interface/post.interface';
import { PostService } from '../../../core/service/post.service';
import { NotificationService } from '../../../core/service/notification.service';

@Component({
  selector: 'app-post-form-modal',
  imports: [FormsModule],
  templateUrl: './post-form-modal.html',
  styleUrl: './post-form-modal.scss',
})
export class PostFormModal implements OnInit {
  @Input() post?: IPost;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  protected title = '';
  protected body = '';
  protected imageUrl = '';
  protected imageFile?: File;
  protected tags = '';
  protected status: PostStatusType = 'draft';
  protected dragOver = false;
  protected submitting = false;

  protected get isEdit(): boolean {
    return !!this.post;
  }

  constructor(
    private postService: PostService,
    private notification: NotificationService,
  ) { }

  ngOnInit(): void {
    if (this.post) {
      this.title = this.post.title;
      this.body = this.post.body;
      this.imageUrl = this.post.imageUrl || '';
      this.status = this.post.status;
      this.tags = this.post.tags.join(', ');
    }
  }

  protected onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.imageFile = file;
      this.imageUrl = URL.createObjectURL(file);
    }
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = true;
  }

  protected onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
    const file = event.dataTransfer?.files[0];
    if (file && file.type.startsWith('image/')) {
      this.imageFile = file;
      this.imageUrl = URL.createObjectURL(file);
    }
  }

  protected removeImage(): void {
    if (this.imageUrl) URL.revokeObjectURL(this.imageUrl);
    this.imageUrl = '';
    this.imageFile = undefined;
  }

  protected async onSubmit(): Promise<void> {
    if (this.submitting) return;
    this.submitting = true;

    try {
      const formData = new FormData();
      formData.append('title', this.title);
      formData.append('body', this.body);
      formData.append('tags', this.tags);
      formData.append('status', this.status);
      if (this.imageFile) {
        formData.append('image', this.imageFile);
      }

      if (this.isEdit) {
        await firstValueFrom(this.postService.updatePost(this.post!.id, formData));
        this.notification.success('Post updated successfully.');
      } else {
        await firstValueFrom(this.postService.createPost(formData));
        this.notification.success('Post created successfully.');
      }

      this.saved.emit();
    } catch {
      this.notification.error(this.isEdit ? 'Failed to update post.' : 'Failed to create post.');
    } finally {
      this.submitting = false;
    }
  }

  protected onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close.emit();
    }
  }
}
