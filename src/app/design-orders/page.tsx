'use client'

import { Table, Tag } from 'antd'
import { useEffect, useState } from 'react'

export default function DesignOrdersPage() {
  const [data, setData] = useState([])

  useEffect(() => {
    fetch('/api/design-orders')
      .then(res => res.json())
      .then(setData)
  }, [])

  const columns = [
    { title: 'ID', dataIndex: 'id' },
    { title: '類型', dataIndex: 'type' },
    { title: '品牌', dataIndex: 'brand' },
    { title: '底色', dataIndex: 'baseColor' },
    { 
      title: '狀態', 
      dataIndex: 'status',
      render: (status: string) => {
        const color = status === '完成' ? 'green' : status === '進行中' ? 'blue' : 'orange'
        return <Tag color={color}>{status}</Tag>
      }
    },
    { title: '優先級', dataIndex: 'priority' },
    { title: '建立時間', dataIndex: 'createdAt' },
  ]

  return (
    <div style={{ padding: 20 }}>
      <h2>設計單管理</h2>
      <Table 
        dataSource={data} 
        rowKey="id" 
        columns={columns} 
      />
    </div>
  )
}