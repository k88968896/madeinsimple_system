import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

// GET 設計單列表（支援查詢參數過濾）
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const status = searchParams.get('status') || undefined
  const priority = searchParams.get('priority') || undefined
  const type = searchParams.get('type') || undefined
  const salesId = searchParams.get('salesId')
  const designerId = searchParams.get('designerId')
  const isClosed = searchParams.get('isClosed')
  const dateFrom = searchParams.get('dateFrom')
  const dateTo = searchParams.get('dateTo')

  const where: any = {}
  if (status) where.status = status
  if (priority) where.priority = priority
  if (type) where.type = type
  if (salesId) where.salesId = Number(salesId)
  if (designerId) where.designerId = Number(designerId)
  if (isClosed === 'true' || isClosed === 'false') where.isClosed = isClosed === 'true'
  if (dateFrom || dateTo) {
    where.createdAt = {}
    if (dateFrom) where.createdAt.gte = new Date(dateFrom)
    if (dateTo) where.createdAt.lte = new Date(dateTo)
  }

  const orders = await prisma.designOrder.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })

  const contents = await (prisma as any).designContent.findMany({
    where: { designOrderId: { in: orders.map(o => o.id) } },
  })
  const contentByOrderId = new Map(contents.map((c: any) => [c.designOrderId, c]))

  const result = orders.map(o => ({ ...o, content: contentByOrderId.get(o.id) || null }))
  return NextResponse.json(result)
}

// POST 新增設計單
export async function POST(req: Request) {
  const body = await req.json()
  const { content, ...orderData } = body

  const order = await prisma.designOrder.create({ data: orderData })
  let createdContent = null
  if (content) {
    createdContent = await (prisma as any).designContent.create({
      data: { ...content, designOrderId: order.id },
    })
  }
  return NextResponse.json({ ...order, content: createdContent })
}
