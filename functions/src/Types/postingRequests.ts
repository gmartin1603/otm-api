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

export type UpdatePostRequest = {
  userId: string;
  postId: string;
  dept: string;
  [key: string]: any; // This allows for additional properties to be added dynamically
}

export type DeletePostRequest = {
  userId: string;
  postId: string;
  dept: string;
  archive: string;
  [key: string]: any; // This allows for additional properties to be added dynamically
}