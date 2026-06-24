import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Store } from '@ngrx/store';
import { Header } from '../../partials/header/header';
import { Footer } from '../../partials/footer/footer';
import { PostCard } from '../post-card/post-card';
import { PostFormModal } from '../post-form-modal/post-form-modal';
import { PostService } from '../../../core/service/post.service';
import { NotificationService } from '../../../core/service/notification.service';
import { IPost } from '../../../core/interface/post.interface';

@Component({
  selector: 'app-home',
  imports: [Header, Footer, PostCard, PostFormModal],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private readonly _postService = inject(PostService);
  private readonly _notification = inject(NotificationService);
  private readonly _store = inject(Store<{ auth: { user: { id: string; name: string; email: string } | null } }>);
  private readonly _route = inject(ActivatedRoute);

  protected posts = signal<IPost[]>([]);
  protected loading = signal(true);
  protected likedIds = signal<Set<string>>(new Set());
  protected currentUserId = '';
  protected searchQuery = '';
  protected showModal = false;
  protected editingPost: IPost | undefined;

  async ngOnInit(): Promise<void> {
    this._store.select(state => state.auth.user).subscribe(user => {
      if (user) this.currentUserId = user.id;
    });

    this._route.queryParams.subscribe(params => {
      this.searchQuery = (params['search'] || '').toLowerCase();
      this.fetchPosts();
    });

    await this.fetchLikedIds();
  }

  protected isLiked(postId: string): boolean {
    return this.likedIds().has(postId);
  }

  protected async fetchPosts(): Promise<void> {
    this.loading.set(true);
    try {
      if (this.searchQuery) {
        const res = await firstValueFrom(this._postService.searchPosts(this.searchQuery));
        this.posts.set(res?.data || []);
      } else {
        const res = await firstValueFrom(this._postService.getAllPublishedPosts());
        this.posts.set(res?.data || []);
      }
    } catch {
      this.posts.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  protected async fetchLikedIds(): Promise<void> {
    try {
      const res = await firstValueFrom(this._postService.getLikedIds());
      this.likedIds.set(new Set(res?.data || []));
    } catch {
      // Not critical
    }
  }

  protected async onToggleLike(postId: string): Promise<void> {
    try {
      const res = await firstValueFrom(this._postService.toggleLike(postId));
      const data = res?.data;
      if (data) {
        this.likedIds.set(new Set(data.likedIds));
        this.posts.update(list => list.map(p => p.id === postId ? { ...p, likes: data.likes } : p));
      }
    } catch {
      this._notification.error('Failed to toggle like');
    }
  }

  protected openCreateModal(): void {
    this.editingPost = undefined;
    this.showModal = true;
  }

  protected openEditModal(post: IPost): void {
    this.editingPost = post;
    this.showModal = true;
  }

  protected closeModal(): void {
    this.showModal = false;
    this.editingPost = undefined;
  }

  protected async onSaved(): Promise<void> {
    this.closeModal();
    await this.fetchPosts();
  }
}
