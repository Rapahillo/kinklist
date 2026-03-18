import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export async function POST() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (sessionToken) {
    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
      select: { userId: true },
    });

    await prisma.session.deleteMany({
      where: { token: sessionToken },
    });

    if (session) {
      void logAudit({ userId: session.userId, action: "session.delete" });
    }
  }

  cookieStore.set("session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(0),
    path: "/",
  });

  return Response.json({ success: true });
}
