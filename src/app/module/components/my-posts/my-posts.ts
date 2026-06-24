import { Component, OnInit, inject, signal } from '@angular/core';
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
  selector: 'app-my-posts',
  imports: [Header, Footer, PostCard, PostFormModal],
  templateUrl: './my-posts.html',
  styleUrl: './my-posts.scss',
})
export class MyPosts implements OnInit {
  private readonly _store = inject(Store<{ auth: { user: { id: string; name: string; email: string } | null } }>);
  private readonly _postService = inject(PostService);
  private readonly _notification = inject(NotificationService);

  protected posts = signal<IPost[]>([]);
  protected loading = signal(true);
  protected activeTab: 'published' | 'draft' = 'published';
  protected showModal = false;
  protected editingPost: IPost | undefined;

  async ngOnInit(): Promise<void> {
    let userId = '';
    this._store.select(state => state.auth.user).subscribe(user => {
      if (user) userId = user.id;
    });

    if (!userId) {
      this.loading.set(false);
      return;
    }

    try {
      const res = await firstValueFrom(this._postService.getPostsByAuthorId(userId));
      this.posts.set(res?.data || []);
    } catch {
      this.posts.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  protected get publishedPosts(): IPost[] {
    return this.posts().filter(p => p.status === 'published');
  }

  protected get draftPosts(): IPost[] {
    return this.posts().filter(p => p.status === 'draft');
  }

  protected setActiveTab(tab: 'published' | 'draft'): void {
    this.activeTab = tab;
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
    await this.refreshPosts();
  }

  protected async deletePost(id: string): Promise<void> {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await firstValueFrom(this._postService.deletePost(id));
      this._notification.success('Post deleted successfully.');
      this.posts.set(this.posts().filter(p => p.id !== id));
    } catch {
      this._notification.error('Failed to delete post.');
    }
  }

  private async refreshPosts(): Promise<void> {
    let userId = '';
    this._store.select(state => state.auth.user).subscribe(user => {
      if (user) userId = user.id;
    });

    if (!userId) return;

    try {
      const res = await firstValueFrom(this._postService.getPostsByAuthorId(userId));
      this.posts.set(res?.data || []);
    } catch {
      this.posts.set([]);
    }
  }
}
