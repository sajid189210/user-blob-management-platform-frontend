import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DatePipe } from '@angular/common';
import { IPost } from '../../../core/interface/post.interface';

@Component({
  selector: 'app-post-card',
  imports: [RouterModule, DatePipe],
  templateUrl: './post-card.html',
  styleUrl: './post-card.scss',
})
export class PostCard {
  @Input({ required: true }) post!: IPost;
  @Input() isLiked = false;
  @Input() currentUserId = '';
  @Output() edit = new EventEmitter<IPost>();
  @Output() delete = new EventEmitter<string>();
  @Output() toggleLike = new EventEmitter<string>();

  protected get isOwner(): boolean {
    return !!this.currentUserId && this.post.author === this.currentUserId;
  }

  protected get displayName(): string {
    return this.post.authorName || this.post.authorEmail?.split('@')[0] || 'Unknown';
  }

  protected get initial(): string {
    return this.displayName.charAt(0).toUpperCase();
  }

  protected onToggleLike(): void {
    this.toggleLike.emit(this.post.id);
  }
}
