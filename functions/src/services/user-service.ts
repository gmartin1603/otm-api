import { Service } from "../Types/type.Service";
import CommonUtils from "../Types/class.CommonUtils";

const _commonUtils = new CommonUtils();
// Firestore helpers (if needed)
const { getAuth } = require("firebase-admin/auth");
const { db } = require("../helpers/firebase");

const userService: Service = {
  name: "userService",

  getUser: async (body) => {
    console.log("Req body: ", body);
    const uid = body.uid;
    const email = body.email;
    // console.log("Fetching user data for uid:", uid);
    if (!uid && !email) {
      throw new Error("User ID or email required to fetch user data");
      // throw { message: "No user ID provided", method: "getUser" };
    }
    
    const get_user_api = () => getAuth().getUser(uid);
    const get_user_by_email_api = () => getAuth().getUserByEmail(email);
    const [user, error] = await _commonUtils.handlePromise(uid? get_user_api : get_user_by_email_api);

    if (error) {
      throw error;
    } 
    const get_user_profile_api = () => db.collection("users").doc(user.uid).get();
    const [profile, profileError] = await _commonUtils.handlePromise(get_user_profile_api);

    if (profileError) {
      throw profileError;
    } else {
      // TODO?: validate that the profile belongs to the user
      return { auth: user, profile: profile.data() };
    }
  },

  createUser: async (body) => {
    // console.log(body);
    if (!body.auth || !body.profile) {
      let msg = "";
      if (!body.auth) {
        msg += "No auth object provided. ";
      }
      if (!body.profile) {
        msg += "No profile object provided.";
      }
      throw new Error(msg);
    }
    const create_user_auth = () => getAuth().createUser(body.auth);

    const [userRecord, error] = await _commonUtils.handlePromise(create_user_auth);

    if (error) {
      throw error;
    }

    // console.log("Successfully created new user: ", userRecord.uid);
    body.profile.id = userRecord.uid;
    const create_user_profile = () => db.collection("users").doc(userRecord.uid).set({ ...body.profile, email: body.auth.email }, { merge: true });

    const [userProfile, profileError] = await _commonUtils.handlePromise(create_user_profile);

    if (profileError) {
      // console.error("Error writing user profile:", profileError);
      throw profileError;
    } else {
      return { auth: userRecord, profile: userProfile };
    }
  },

  getVerificationLink: async (body) => {
    const email = body.email;
    // console.log("Sending verification email to: ", email);
    const send_verification_email_api = () => getAuth().generateEmailVerificationLink(email)
    const [link, error] = await _commonUtils.handlePromise(send_verification_email_api);
    
    if (error) {
      console.error("Error sending verification email:", error);
      throw error;
    } else {
      // console.log("Successfully sent verification email");
      return { link };
    }
  },

  getPasswordResetLink: async (body) => {
    const email = body.email;
    // console.log("Sending password reset email to: ", email);
    const send_password_reset_email_api = () => getAuth().generatePasswordResetLink(email);
    const [link, error] = await _commonUtils.handlePromise(send_password_reset_email_api);

    if (error) {
      console.error("Error sending password reset email:", error);
      throw error;
    } else {
      // console.log("Successfully sent password reset email");
      return { link };
    }
  },

  updateUser: async (body) => {
    const uid = body.uid;
    if (!uid) {
      throw new Error("No user ID provided");
    }

    const update_profile_api = () => 
      db
        .collection("users")
        .doc(uid)
        .set(body.profile, { merge: true });
    const [user, error] = await _commonUtils.handlePromise(update_profile_api);

    if (error) {
      throw error;
    } else {
      if (body.auth) {
        const update_auth_api = () => getAuth().updateUser(uid, body.auth);
        const [auth, authError] = await _commonUtils.handlePromise(update_auth_api);
        if (authError) {
          throw authError;
        } else {
          let response = {
            message: "Successfully updated user",
            auth: auth,
            profile: user,
          }
          return response;
        }
      } else {
        let response = {
          message: "Successfully updated user",
          profile: user,
        }
        return response;
      }
    }
  },

  disableUser: async (body) => {
    const uid = body.uid;
    if (!uid) {
      throw new Error("No user ID provided");
    } else if (body.disabled === undefined) {
      body.disabled = true;
    }

    const disable_user_api = () => getAuth().updateUser(uid, { disabled: body.disabled });
    const [user, error] = await _commonUtils.handlePromise(disable_user_api);

    if (error) {
      throw error;
    } else {
      return user;
    }
  },

  deleteUser: async ({uid}) => {
    if (!uid) {
      throw new Error("No user ID provided");
    }

    const delete_auth_api = () => getAuth().deleteUser(uid);
    const [auth, error] = await _commonUtils.handlePromise(delete_auth_api);

    if (error) {
      throw error;
    } else {
      const delete_profile_api = () => db.collection("users").doc(uid).delete();
      const [profile, profileError] = await _commonUtils.handlePromise(delete_profile_api);

      if (profileError) {
        throw profileError;
      } else {
        let response = {
          message: "Successfully deleted user",
          auth: auth,
          profile: profile,
        }
        return response;
      }
    }
  }
};

export default userService;
