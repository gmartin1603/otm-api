import { GetPostRequest, GetPostsRequest } from "../Types/postingRequests";

/**
 * @module postings-service
 * @requires firebase-admin/auth
 * @description This module provides the service for the "/postings/*" routes 
 * @description postings-service handles the business logic for /postings endpoints
 * @description postings-service is called by and returns to postings-controller
 * @exports postingsService
 */
const { handlePromise } = require("./common-service");
// Firestore helpers (if needed)
// const { getAuth } = require("firebase-admin/auth");
const { db, admin } = require("../helpers/firebase");
const jobsService = require("./jobs-service");

const postingsService = {
  name: "postingsService",
  getName: () => postingsService.name,
  getPost: async (body: GetPostRequest) => {
    const {id} = body;

    if (!id) {
      throw new Error("No ID provided");
    }
  
    const get_post_api = () => db.collection(`${body.dept}-posts`).doc(id).get();
    const [data, error] = await handlePromise(get_post_api);
  
    if (error) {
      throw new Error(error);
    } else {
      return data.data();
    }
  },

  getPosts: async (body: GetPostsRequest) => {
    const dept = body.dept;
  
    const get_posts_api = () => db.collection(`${dept}-posts`).get();
    const [result, error] = await handlePromise(get_posts_api);
  
    if (error) {
      throw new Error(error);
    } else {
      let postings = result.docs.map(doc => doc.data());
      return { total: postings.length, postings: postings };
    }
  },

  updatePost: async (body) => {
    const {userId, postId, dept} = body;
    
    if (!postId) {
      throw new Error("No post ID provided");
    } else if (!dept) {
      throw new Error("No department provided");
    } else if (!userId) {
      throw new Error("No user ID provided");
    }

    let post = body.post;
    
    // Get user display name from user ID
    const get_user_api = () => admin.auth().getUser(userId);
    const [user, userError] = await handlePromise(get_user_api);

    if (userError) {
      throw new Error(userError);
    } else {
      body.post["updated_by"] = user.displayName;
      post["updated_at"] = new Date().getTime();
    }
    
    const update_post_api = () => db.collection(`${dept}-posts`).doc(postId).set(post, { merge: true });
    const [_, error] = await handlePromise(update_post_api);

    if (error) {
      throw new Error(error);
    } else {
      return true;
    }
  },

  updatePostNoMerge: async (req) => {
    const {userId, postId, dept} = req.body;
    // console.log(body);
    if (!postId) {
      throw new Error("No post ID provided");
    } else if (!dept) {
      throw new Error("No department provided");
    } else if (!userId) {
      throw new Error("No user ID provided");
    }
    let post = req.body.post;
    // console.log("Updating post:", post);
    post["updated_by"] = userId;
    post["updated_at"] = new Date();
    
    const update_post_api = () => db.collection(`${dept}-posts`).doc(postId).set(post);
    const [_, error] = await handlePromise(update_post_api);

    if (error) {
      throw new Error(error);
    } else {
      return true;
    }
  },

  // deletePost: async (body) => {
  //   const {postId, dept, archive} = body;
    
  //   if (postId === "" || postId === undefined) {
  //     throw new Error("No post ID provided")
  //   } else if (dept === "" || dept === undefined) {
  //     throw new Error("No department provided")
  //   } else if (archive === "" || archive === undefined) {
  //     throw new Error("No archive provided")
  //   }

  //   const post = await postingsService.getPost({id: postId});
  //   const pos = await jobsService.getJob({id: post.pos, dept: dept});

  //   const misc = pos.group === "misc";

  //   // await db
  //   // .collection(`${dept}-posts`)
  //   // .doc(postId).delete()
  //   // .then(() => {
  //   //   console.log(`${postId} Deleted!`)
  //   // })
  //   // .catch((error) => {
  //   //   throw new Error(error)
  //   // })
  //   if (misc) {
  //     let obj = {}
      
  //     const get_archive_doc_api = () => db
  //     .collection(dept)
  //     .doc('rota')
  //     .collection('archive')
  //     .doc(archive)
  //     .get()

  //     const [get_archive, get_error] = await handlePromise(get_archive_doc_api);

  //     if (get_error) {
  //       throw new Error(`Error getting Archive doc: ${archive}`)
  //     } else if (get_archive.data()) {
  //       // Update Archive Doc
  //       obj = new Object(get_archive.data())
  //       obj[body.shift].rows.map((row) => {
  //         if (row.id === pos.id) {
  //           let active = false
  //           for (const key in row) {
  //             if (Number.isInteger(parseInt(key))) {
  //               if (row[key] === postId) {
  //                 console.log("Remove", postId)
  //                 row[key] = ""
  //               } else if (row[key].length > 0) {
  //                 active = true
  //               }
  //             }
  //           }
  //           if (!active) {
  //             console.log("Deleting Row", row.id)
  //             obj[shift].rows = obj[shift].rows.filter((row) => row.id !== pos.id)
  //           }
  //         }
  //       })
  //       // Save Update
  //       await db
  //       .collection(dept)
  //       .doc('rota')
  //       .collection('archive')
  //       .doc(archive)
  //       .set(obj)
  //       .then(() => {
  //         console.log(`${archive} Updated!`)
  //       })
  //       .catch((error) => {
  //         console.log(error)
  //       })
  //       return {message: "Operation Complete, archive updated"}
  //     } else {
  //       return {message: "No Archive Document Found"}
  //     }
  //   } else {
  //     return {message: "Operation Complete, no archive update"}
  //   }
  // }
};

export default postingsService;
