import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// ✅ Export authOptions so other files (like buyers API) can import it
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Demo Login",
      credentials: {
        username: { label: "Username", type: "text" },
      },
    async authorize(credentials) {
        if (!credentials?.username) return null;
            return {
                id: credentials.username,      // use this as stable user id
                name: credentials.username,    // display name
        };
    },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

// ✅ Pass authOptions into NextAuth
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
