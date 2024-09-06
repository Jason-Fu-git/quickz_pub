import NextAuth, { AuthError } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { db, getUserByName } from '@/lib/db';

const home_url = process.env.NEXTAUTH_URL || 'http://localhost:3000';

// Custom function to verify user credentials
const authenticateUser = async (username: any, password: any) => {
  // Implement your user authentication logic here
  const user = await getUserByName(username, 'password');
  if (user && user.password === password) {
    return {
      id: user.id.toString(),
      name: user.name.toString(),
      image: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&format=png`
    };
  }
  return null;
};

const providers = [
  // GitHub,
  // customized email + password authentication
  Credentials({
    name: 'credentials',
    credentials: {
      username: { label: 'Username', type: 'text' },
      password: { label: 'Password', type: 'password' }
    },
    authorize: async (credentials) => {
      let user = await authenticateUser(
        credentials.username,
        credentials.password
      );
      if (!user) {
        throw new AuthError('User not found');
      }
      return user;
    }
  })
];

// other login methods aside from credentials
export const providerMap = providers.map((provider) => {
  if (typeof provider === 'function') {
    // @ts-ignore
    const providerData = provider();
    return { id: providerData.id, name: providerData.name };
  } else {
    return { id: provider.id, name: provider.name };
  }
}).filter((provider) => provider.id !== 'credentials');


export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: providers,
  pages: {
    signIn: '/signIn',
    error: '/login/error'
  },
  callbacks: {
    async redirect(route) {
      return home_url;
    },
    async session({ session, token }) {
      if (token && token.id && typeof token.id === 'string') {
        session.user.id = token.id;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    }
  }
});
