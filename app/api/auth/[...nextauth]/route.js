//app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/config/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

// Required for getServerSession() to work in other files
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Connect to the database
        await dbConnect();

        // Find user by email
        const user = await User.findOne({ email: credentials.email });
        if (!user) throw new Error("Invalid email or password");

        // Compare hashed passwords
        const isMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isMatch) throw new Error("Invalid email or password");

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login", // Optional: redirect to your custom login page
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
