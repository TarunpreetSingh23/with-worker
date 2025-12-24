// import NextAuth from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import connectDB from "@/lib/mongodb";
// import Worker from "@/models/Worker";
// import bcrypt from "bcryptjs";

// const handler = NextAuth({
//   providers: [
//   CredentialsProvider({
//   name: "Credentials",
//   credentials: {
//     workerId: { label: "Worker ID", type: "text" },
//     password: { label: "Password", type: "password" },
//   },
//   async authorize(credentials) {
//     await connectDB();
//     const worker = await Worker.findOne({ workerId: credentials.workerId });
//     if (!worker) throw new Error("Worker not found");
//  console.log(worker)
//     const isPasswordValid = await bcrypt.compare(
//       credentials.password,
//       worker.password
//     );
//     console.log(credentials.password)
//     console.log(worker.password)
//     console.log(isPasswordValid)
//     // if (!isPasswordValid) throw new Error("Invalid password");

//     return {
//       id: worker._id.toString(),
//       workerId: worker.workerId,
//       name: worker.name,
//       role: worker.role,
//     };
//   },
// }),

//   ],
//  // [...nextauth].js or [...nextauth]/route.js

// callbacks: {
//   async jwt({ token, user }) {
//     if (user) {
//       token.workerId = user.workerId; // 🔑 store workerId in JWT
//     }
//     return token;
//   },
//   async session({ session, token }) {
//     if (token?.workerId) {
//       session.user.workerId = token.workerId; // 🔑 put it back in session
//     }
//     return session;
//   },
// },

//   pages: {
//     signIn: "/worker-login",
//   },
//   secret: process.env.NEXTAUTH_SECRET,
// });

// export { handler as GET, handler as POST };
