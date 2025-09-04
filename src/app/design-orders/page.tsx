'use client'

import { Table, Tag } from 'antd'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function DesignOrdersPage() {
  const [data, setData] = useState<any[]>([])

  const typeLabel: Record<string, string> = {
    new: '設計新增單',
    edit: '設計修改單',
  }

  const statusLabel: Record<string, string> = {
    pending: '未處理',
    processing: '進行中',
    review: '待確認',
    done: '已完成',
  }

  const statusColor: Record<string, string> = {
    pending: 'orange',
    processing: 'blue',
    review: 'gold',
    done: 'green',
  }

  const priorityLabel: Record<string, string> = {
    high: '高',
    medium: '中',
    low: '低',
  }

  // filters
  const [status, setStatus] = useState<string | undefined>(undefined)
  const [priority, setPriority] = useState<string | undefined>(undefined)
  const [isClosed, setIsClosed] = useState<string | undefined>(undefined)

  const load = () => {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (priority) params.set('priority', priority)
    if (isClosed) params.set('isClosed', isClosed)
    const qs = params.toString()

    fetch('/api/design-orders' + (qs ? `?${qs}` : ''))
      .then(res => res.json())
      .then((rows) => {
        const mapped = rows.map((r: any) => ({
          ...r,
          _typeLabel: typeLabel[r.type] || r.type,
          _statusLabel: statusLabel[r.status] || r.status,
          _priorityLabel: priorityLabel[r.priority] || r.priority,
          _brand: r.content?.brand ?? r.brand ?? '-',
          _baseColor: r.content?.baseColor ?? r.baseColor ?? '-',
        }))
        setData(mapped)
      })
  }

  useEffect(() => { load() }, [status, priority, isClosed])

  const columns = [
    { title: 'ID', dataIndex: 'id' },
    { title: '類型', dataIndex: '_typeLabel' },
    { title: '品牌', dataIndex: '_brand' },
    { title: '底色', dataIndex: '_baseColor' },
    { 
      title: '狀態', 
      dataIndex: 'status',
      render: (_: any, record: any) => {
        const code = record.status
        const label = record._statusLabel
        const color = statusColor[code] || 'default'
        return <Tag color={color}>{label}</Tag>
      }
    },
    { title: '優先級', dataIndex: '_priorityLabel' },
    { title: '建立時間', dataIndex: 'createdAt' },
    { title: '結案', dataIndex: 'isClosed', render: (v: boolean) => v ? '是' : '否' },
    { title: '業務ID', dataIndex: 'salesId' },
    { title: '設計師ID', dataIndex: 'designerId' },
    { title: '操作', dataIndex: 'action', render: (_: any, r: any) => (
      <div style={{ display: 'flex', gap: 8 }}>
        <Link href={`/design-orders/${r.id}`}>編輯</Link>
        {!r.isClosed && r.status !== 'done' && (
          <a onClick={async (e) => {
            e.preventDefault()
            await fetch(`/api/design-orders/${r.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'done' }),
            })
            load()
          }}>標記完成</a>
        )}
        {!r.isClosed && (
          <a onClick={async (e) => {
            e.preventDefault()
            await fetch(`/api/design-orders/${r.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ isClosed: true }),
            })
            load()
          }}>結案</a>
        )}
      </div>
    ) },
  ]

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h2>設計單管理</h2>
        <Link href="/design-orders/new" style={{ padding: '6px 12px', background: '#1677ff', color: '#fff', borderRadius: 6 }}>新增</Link>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <select value={status || ''} onChange={e => setStatus(e.target.value || undefined)}>
          <option value="">全部狀態</option>
          <option value="pending">未處理</option>
          <option value="processing">進行中</option>
          <option value="review">待確認</option>
          <option value="done">已完成</option>
        </select>
        <select value={priority || ''} onChange={e => setPriority(e.target.value || undefined)}>
          <option value="">全部優先級</option>
          <option value="high">高</option>
          <option value="medium">中</option>
          <option value="low">低</option>
        </select>
        <select value={isClosed || ''} onChange={e => setIsClosed(e.target.value || undefined)}>
          <option value="">全部案件</option>
          <option value="false">未結案</option>
          <option value="true">已結案</option>
        </select>
      </div>

      <Table 
        dataSource={data} 
        rowKey="id" 
        columns={columns}
        expandable={{
          expandedRowRender: (record) => (
            <div>
              <div>圖案位置：{record.content?.position ?? '-'}</div>
              <div>圖案大小：{record.content?.size ?? '-'}</div>
              <div>文宣類型：{record.content?.leafletType ?? '-'}</div>
              <div>檔案：{record.content?.fileUrl ? <a href={record.content.fileUrl} target="_blank">連結</a> : '-'}</div>
              <div>素材/連結與說明：</div>
              {record.content?.assetNote ? (
                <div style={{ whiteSpace: 'pre-wrap' }}>
                  {record.content.assetNote}
                  {(() => {
                    const text: string = record.content.assetNote || ''
                    const httpMatch = text.match(/https?:\/\/\S+\.(png|jpe?g|gif|webp)/i)
                    const dataMatch = text.match(/data:image\/[a-zA-Z+.-]+;base64,[A-Za-z0-9+/=]+/)
                    const src = httpMatch?.[0] || dataMatch?.[0]
                    if (!src) return null
                    return (
                      <div style={{ marginTop: 8 }}>
                        <img src={src} alt="預覽" style={{ maxWidth: 240, border: '1px solid #eee', borderRadius: 6 }} />
                      </div>
                    )
                  })()}
                </div>
              ) : ('-')}
              <div>最近更新：{record.updatedAt}</div>
            </div>
          )
        }} 
      />
    </div>
  )
}