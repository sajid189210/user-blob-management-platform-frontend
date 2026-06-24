import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IPost } from '../interface/post.interface';
import { IResponse } from '../interface/auth.interface';

@Injectable({
    providedIn: 'root',
})
export class PostService {
    private readonly _http = inject(HttpClient);
    private readonly _postUrl = `${environment.apiUrl}/posts`;

    getAllPublishedPosts(): Observable<IResponse<IPost[]>> {
        return this._http.get<IResponse<IPost[]>>(`${this._postUrl}/published`);
    }

    getPostsByAuthorId(authorId: string): Observable<IResponse<IPost[]>> {
        return this._http.get<IResponse<IPost[]>>(`${this._postUrl}/author/${authorId}`);
    }

    getPostById(id: string): Observable<IResponse<IPost>> {
        return this._http.get<IResponse<IPost>>(`${this._postUrl}/${id}`);
    }

    createPost(formData: FormData): Observable<IResponse<IPost>> {
        return this._http.post<IResponse<IPost>>(this._postUrl, formData);
    }

    updatePost(id: string, formData: FormData): Observable<IResponse<IPost>> {
        return this._http.put<IResponse<IPost>>(`${this._postUrl}/${id}`, formData);
    }

    deletePost(id: string): Observable<IResponse<null>> {
        return this._http.delete<IResponse<null>>(`${this._postUrl}/${id}`);
    }

    toggleLike(postId: string): Observable<IResponse<{ liked: boolean; likedIds: string[]; likes: number }>> {
        return this._http.post<IResponse<{ liked: boolean; likedIds: string[]; likes: number }>>(`${this._postUrl}/${postId}/like`, {});
    }

    getLikedPosts(): Observable<IResponse<IPost[]>> {
        return this._http.get<IResponse<IPost[]>>(`${this._postUrl}/liked`);
    }

    getLikedIds(): Observable<IResponse<string[]>> {
        return this._http.get<IResponse<string[]>>(`${this._postUrl}/liked/ids`);
    }
}
