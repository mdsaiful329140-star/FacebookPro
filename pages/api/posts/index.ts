import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import authOptions from "../auth/[...nextauth]";

type Data = { message: string } | any;

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method === "GET") {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: { author: { select: { id: true, name: true, image: true } } }
    });
    return res.status(200).json(posts);
  }

  if (req.method === "POST") {
    // Create post -- require authenticated user
    // getServerSession requires passing authOptions; we adapted above via export default function.
    const session = await getServerSession(req, res, authOptions as any);
    if (!session || !session.user?.email) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return res.status(401).json({ message: "User not found" });

    const { content } = req.body;
    if (!content || typeof content !== "string") {
      return res.status(400).json({ message: "Invalid content" });
    }

    const post = await prisma.post.create({
      data: {
        authorId: user.id,
        content
      },
      include: { author: { select: { id: true, name: true, image: true } } }
    });

    return res.status(201).json(post);
  }

  res.setHeader("Allow", "GET, POST");
  res.status(405).end("Method Not Allowed");
}
