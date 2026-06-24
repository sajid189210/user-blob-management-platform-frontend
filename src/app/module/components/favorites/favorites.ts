import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Header } from '../../partials/header/header';
import { Footer } from '../../partials/footer/footer';
import { PostCard } from '../post-card/post-card';
import { PostService } from '../../../core/service/post.service';
import { IPost } from '../../../core/interface/post.interface';

@Component({
  selector: 'app-favorites',
  imports: [RouterModule, Header, Footer, PostCard],
  templateUrl: './favorites.html',
  styleUrl: './favorites.scss',
})
export class Favorites implements OnInit {
  private readonly _postService = inject(PostService);

  protected posts = signal<IPost[]>([]);
  protected loading = signal(true);

  async ngOnInit(): Promise<void> {
    await this.fetchLiked();
  }

  protected async fetchLiked(): Promise<void> {
    try {
      const res = await firstValueFrom(this._postService.getLikedPosts());
      this.posts.set(res?.data || []);
    } catch {
      this.posts.set([]);
    } finally {
      this.loading.set(false);
    }
  }
}
