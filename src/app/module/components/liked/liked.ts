import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Store } from '@ngrx/store';
import { Header } from '../../partials/header/header';
import { Footer } from '../../partials/footer/footer';
import { PostCard } from '../post-card/post-card';
import { PostService } from '../../../core/service/post.service';
import { NotificationService } from '../../../core/service/notification.service';
import { IPost } from '../../../core/interface/post.interface';

@Component({
  selector: 'app-liked',
  imports: [RouterModule, Header, Footer, PostCard],
  templateUrl: './liked.html',
  styleUrl: './liked.scss',
})
export class Liked implements OnInit {
  private readonly _postService = inject(PostService);
  private readonly _notification = inject(NotificationService);
  private readonly _store = inject(Store<{ auth: { user: { id: string; name: string; email: string } | null } }>);

  protected posts = signal<IPost[]>([]);
  protected likedIds = signal<Set<string>>(new Set());
  protected loading = signal(true);
  protected currentUserId = '';

  async ngOnInit(): Promise<void> {
    this._store.select(state => state.auth.user).subscribe(user => {
      if (user) this.currentUserId = user.id;
    });
    await this.fetchLiked();
  }

  protected isLiked(postId: string): boolean {
    return this.likedIds().has(postId);
  }

  protected async fetchLiked(): Promise<void> {
    try {
      const res = await firstValueFrom(this._postService.getLikedPosts());
      const items = res?.data || [];
      this.posts.set(items);
      this.likedIds.set(new Set(items.map(p => p.id)));
    } catch {
      this.posts.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  protected async onToggleLike(postId: string): Promise<void> {
    try {
      const res = await firstValueFrom(this._postService.toggleLike(postId));
      const data = res?.data;
      if (data) {
        const updatedLiked = new Set(data.likedIds);
        this.likedIds.set(updatedLiked);
        this.posts.update(list => list.filter(p => updatedLiked.has(p.id)));
      }
    } catch {
      this._notification.error('Failed to toggle like');
    }
  }
}
