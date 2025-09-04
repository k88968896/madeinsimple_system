import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id)
  const order = await prisma.designOrder.findUnique({ where: { id } })
  if (!order) return NextResponse.json({ message: 'Not found' }, { status: 404 })
  const content = await (prisma as any).designContent.findUnique({ where: { designOrderId: id } })
  return NextResponse.json({ ...order, content })
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id)
  const body = await req.json()
  const { content, ...orderData } = body

  const order = await prisma.designOrder.update({ where: { id }, data: orderData })
  let updatedContent = null
  if (content) {
    updatedContent = await (prisma as any).designContent.upsert({
      where: { designOrderId: id },
      update: content,
      create: { ...content, designOrderId: id },
    })
  }
  return NextResponse.json({ ...order, content: updatedContent })
}


