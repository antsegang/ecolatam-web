export interface Post {
  id: number | string;
  authorId: number | string;
  authorName?: string;
  authorAvatarUrl?: string;
  roleTags?: string[]; // e.g., ['vip','volunteer','business','guide']
  content: string;
  media?: Array<{ cid: string; mime?: string; iv?: string }>; // optional encrypted IPFS refs
  createdAt: string; // ISO string
  likes?: number;
  commentsCount?: number;
}

export type FeedFilter = 'all' | 'business' | 'volunteer' | 'guide' | 'vip';

