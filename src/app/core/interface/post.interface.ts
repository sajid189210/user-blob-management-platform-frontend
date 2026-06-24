export interface IPost {
    id: string;
    title: string;
    body: string;
    imageUrl?: string;
    tags: string[];
    status: PostStatusType;
    author: string;
    authorEmail?: string;
    authorName?: string;
    likes: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface IPostFormData {
    title: string;
    body: string;
    imageFile?: File;
    tags: string;
    status: PostStatusType;
    post?: IPost;
}

export type PostStatusType = 'draft' | 'published';
