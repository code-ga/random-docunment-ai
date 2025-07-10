import { createAuthClient } from 'better-auth/react';
import { BASE_API_URL } from '../constant';

const authClient = createAuthClient({
  baseURL: BASE_API_URL + '/api/auth',
  fetchOptions: {
    credentials: "include"
  }
});

export const {
  useSession,
  signIn,
  signUp,
  signOut,
  forgetPassword,
  linkSocial,
  unlinkAccount,
  listAccounts,
  updateUser,
  changePassword,
  resetPassword,
} = authClient;


export default authClient;
