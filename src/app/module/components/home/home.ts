import { Component, OnInit, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Header } from '../../partials/header/header';
import { Footer } from '../../partials/footer/footer';
import { PostCard } from '../post-card/post-card';
import { PostFormModal } from '../post-form-modal/post-form-modal';
import { PostService } from '../../../core/service/post.service';
import { IPost } from '../../../core/interface/post.interface';

@Component({
  selector: 'app-home',
  imports: [Header, Footer, PostCard, PostFormModal],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  protected posts = signal<IPost[]>([]);
  protected loading = signal(true);
  protected showModal = false;
  protected editingPost: IPost | undefined;

  constructor(private postService: PostService) {}

  async ngOnInit(): Promise<void> {
    await this.fetchPosts();
  }

  protected async fetchPosts(): Promise<void> {
    try {
      const res = await firstValueFrom(this.postService.getAllPublishedPosts());
      this.posts.set(res?.data || []);
    } catch {
      this.posts.set([]);
    } finally {
      this.loading.set(false);
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
