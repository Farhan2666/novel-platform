import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireAuth();
    let wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet) {
      wallet = await prisma.wallet.create({ data: { userId: user.id, coins: 0 } });
    }
    return Response.json(wallet);
  } catch (e: any) {
    if (e.message === "Unauthorized") return Response.json({ error: "Login diperlukan" }, { status: 401 });
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { chapterId } = await request.json();
    if (!chapterId) return Response.json({ error: "Chapter ID diperlukan" }, { status: 400 });

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: { id: true, coinPrice: true, novel: { select: { authorId: true } } },
    });
    if (!chapter) return Response.json({ error: "Bab tidak ditemukan" }, { status: 404 });
    if (chapter.coinPrice === 0) return Response.json({ error: "Bab gratis" }, { status: 400 });

    const existingPurchase = await prisma.chapterPurchase.findUnique({
      where: { userId_chapterId: { userId: user.id, chapterId } },
    });
    if (existingPurchase) return Response.json({ error: "Sudah dibeli" }, { status: 400 });

    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet || wallet.coins < chapter.coinPrice) {
      return Response.json({ error: "Koin tidak mencukupi" }, { status: 402 });
    }

    const [purchase] = await prisma.$transaction([
      prisma.chapterPurchase.create({
        data: { userId: user.id, chapterId, coinsPaid: chapter.coinPrice },
      }),
      prisma.wallet.update({
        where: { userId: user.id },
        data: { coins: { decrement: chapter.coinPrice } },
      }),
      prisma.coinTransaction.create({
        data: { userId: user.id, amount: -chapter.coinPrice, description: `Pembelian bab ${chapterId}` },
      }),
    ]);

    return Response.json(purchase);
  } catch (e: any) {
    if (e.message === "Unauthorized") return Response.json({ error: "Login diperlukan" }, { status: 401 });
    return Response.json({ error: e.message }, { status: 500 });
  }
}
