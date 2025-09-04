import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

// GET 所有設計單
export async function GET() {
  const orders = await prisma.designOrder.findMany()
  return NextResponse.json(orders)
}

// POST 新增設計單
export async function POST(req: Request) {
  const data = await req.json()
  const order = await prisma.designOrder.create({ data })
  return NextResponse.json(order)
}
