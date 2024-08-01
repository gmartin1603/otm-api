/**
 * @module postings-service
 * @requires firebase-admin/auth
 * @description This module provides the service for the "/postings/*" routes 
 * @description postings-service handles the business logic for /postings endpoints
 * @description postings-service is called by and returns to postings-controller
 * @exports postingsService
 */
const { handlePromise, handleResponse } = require("./common-service");
// Firestore helpers (if needed)
// const { getAuth } = require("firebase-admin/auth");
const { db, admin } = require("../helpers/firebase");

const postingsService = {
  // Add service methods here
  // Example:
  getPost: async (req) => {
    console.log("postingsEx fired");
    const body = req.body;
    // console.log("Req body: ", body);
    const id = body.id;

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

  getPosts: async (req) => {
    const body = req.body;
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

  updatePost: async (req) => {
    const {userId, postId, dept} = req.body;
    
    if (!postId) {
      throw new Error("No post ID provided");
    } else if (!dept) {
      throw new Error("No department provided");
    } else if (!userId) {
      throw new Error("No user ID provided");
    }

    let post = req.body.post;
    
    // Get user display name from user ID
    const get_user_api = () => admin.auth().getUser(userId);
    const [user, userError] = await handlePromise(get_user_api);

    if (userError) {
      throw new Error(userError);
    } else {
      req.body.post["updated_by"] = user.displayName;
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
  }
};

module.exports = postingsService;
