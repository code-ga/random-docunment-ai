import { createAuthClient } from 'better-auth/react';
import { BASE_API_URL } from '../constain';

const authClient = createAuthClient({
  baseURL: BASE_API_URL + '/auth',
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
