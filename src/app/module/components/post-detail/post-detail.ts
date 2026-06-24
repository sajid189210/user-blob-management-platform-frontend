import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DatePipe } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { Store } from '@ngrx/store';
import { Header } from '../../partials/header/header';
import { Footer } from '../../partials/footer/footer';
import { PostFormModal } from '../post-form-modal/post-form-modal';
import { PostService } from '../../../core/service/post.service';
import { NotificationService } from '../../../core/service/notification.service';
import { IPost } from '../../../core/interface/post.interface';

@Component({
  selector: 'app-post-detail',
  imports: [RouterModule, DatePipe, Header, Footer, PostFormModal],
  templateUrl: './post-detail.html',
  styleUrl: './post-detail.scss',
})
export class PostDetail implements OnInit {
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);
  private readonly _store = inject(Store<{ auth: { user: { id: string; name: string; email: string } | null } }>);
  private readonly _notification = inject(NotificationService);
  private readonly _postService = inject(PostService);

  protected post: IPost | null = null;
  protected loading = signal(true);
  protected error = signal(false);
  protected currentUserId = '';
  protected isLiked = false;
  protected showModal = false;
  protected editingPost: IPost | undefined;

  async ngOnInit(): Promise<void> {
    this._store.select(state => state.auth.user).subscribe(user => {
      if (user) this.currentUserId = user.id;
    });

    try {
      const id = this._route.snapshot.paramMap.get('id');
      if (!id) {
        this.error.set(true);
        return;
      }

      const [postRes, likedRes] = await Promise.all([
        firstValueFrom(this._postService.getPostById(id)),
        firstValueFrom(this._postService.getLikedIds()).catch(() => ({ data: [] as string[] })),
      ]);

      this.post = postRes?.data ?? null;
      this.isLiked = (likedRes?.data || []).includes(id);
      if (!this.post) this.error.set(true);
    } catch (e) {
      console.error('Failed to load post:', e);
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  protected get isOwner(): boolean {
    return !!this.currentUserId && this.post?.author === this.currentUserId;
  }

  protected get displayName(): string {
    return this.post?.authorName || this.post?.authorEmail?.split('@')[0] || 'Unknown';
  }

  protected get initial(): string {
    return this.displayName.charAt(0).toUpperCase();
  }

  protected async onToggleLike(): Promise<void> {
    if (!this.post) return;
    try {
      const res = await firstValueFrom(this._postService.toggleLike(this.post.id));
      const data = res?.data;
      if (data) {
        this.isLiked = data.liked;
        this.post = { ...this.post, likes: data.likes };
      }
    } catch {
      this._notification.error('Failed to toggle like');
    }
  }

  protected openEditModal(): void {
    this.editingPost = this.post ?? undefined;
    this.showModal = true;
  }

  protected closeModal(): void {
    this.showModal = false;
    this.editingPost = undefined;
  }

  protected async onSaved(): Promise<void> {
    this.closeModal();
    const id = this._route.snapshot.paramMap.get('id');
    if (!id) return;
    try {
      const res = await firstValueFrom(this._postService.getPostById(id));
      this.post = res?.data ?? null;
    } catch {
      this._notification.error('Failed to refresh post.');
    }
  }

  protected async deletePost(): Promise<void> {
    if (!this.post) return;
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await firstValueFrom(this._postService.deletePost(this.post.id));
      this._notification.success('Post deleted successfully.');
      this._router.navigate(['/home']);
    } catch {
      this._notification.error('Failed to delete post.');
    }
  }
}
