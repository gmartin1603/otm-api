export type GetPostRequest = {
  id: string;
  dept: string;
}

export type GetPostsRequest = {
  dept: string;
}

export type CreatePostRequest = {
  dept: string;
  [key: string]: any; // This allows for additional properties to be added dynamically
}