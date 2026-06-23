import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient, UserRole } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";

const getDbUrl = () => process.env.DATABASE_URL!;

const createPrisma = () => {
  const dbUrl = getDbUrl();
  const url = new URL(dbUrl);
  const adapter = new PrismaMariaDb({
    host: url.hostname || "localhost",
    port: url.port ? parseInt(url.port) : 3306,
    user: url.username || "root",
    password: url.password || undefined,
    database: url.pathname.replace(/^\//, ""),
  });
  return new PrismaClient({ adapter });
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const prisma = createPrisma();
        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });

          if (!user || !user.password) {
            return null;
          }

          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isValid) {
            return null;
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            bio: user.bio,
            avatarUrl: user.avatarUrl,
          };
        } finally {
          await prisma.$disconnect();
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.bio = user.bio;
        token.avatarUrl = user.avatarUrl;
      }

      if (trigger === "update" && session?.user) {
        token.name = session.user.name ?? token.name;
        token.bio = session.user.bio ?? token.bio;
        token.avatarUrl = session.user.avatarUrl ?? token.avatarUrl;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.bio = token.bio as string | null | undefined;
        session.user.avatarUrl = token.avatarUrl as string | null | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/tungkuaceh",
  },
  session: {
    strategy: "jwt",
  },
});
