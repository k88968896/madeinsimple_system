'use client'

import '@ant-design/v5-patch-for-react-19';
import { Button, Form, Input, Radio, Select, Space, message } from 'antd'
import { useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function EditDesignOrderPage() {
  const router = useRouter()
  const params = useParams()
  const id = Number(params?.id)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()
  const assetNote = Form.useWatch('assetNote', form)

  const extractFirstImageUrl = (text?: string): string | null => {
    if (!text) return null
    const httpMatch = text.match(/https?:\/\/\S+\.(png|jpe?g|gif|webp)/i)
    if (httpMatch) return httpMatch[0]
    const dataMatch = text.match(/data:image\/[a-zA-Z+.-]+;base64,[A-Za-z0-9+/=]+/)
    return dataMatch ? dataMatch[0] : null
  }
  const previewSrc = useMemo(() => extractFirstImageUrl(assetNote || ''), [assetNote])

  const filesToDataUrls = async (files: FileList | File[]): Promise<string[]> => {
    const list = Array.from(files)
    const readers = list.map(file => new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error('讀取檔案失敗'))
      reader.readAsDataURL(file)
    }))
    return Promise.all(readers)
  }

  const appendToAssetNote = (inserts: string[]) => {
    const current = form.getFieldValue('assetNote') || ''
    const addition = inserts.join('\n')
    form.setFieldsValue({ assetNote: current ? current + '\n' + addition : addition })
  }

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/design-orders/${id}`)
        const data = await res.json()
        const init: any = {
          type: data.type,
          status: data.status,
          priority: data.priority,
          salesId: data.salesId,
          designerId: data.designerId ?? undefined,
          category: data.content?.category ?? 'clothes',
          brand: data.content?.brand ?? undefined,
          baseColor: data.content?.baseColor ?? undefined,
          position: data.content?.position ?? undefined,
          size: data.content?.size ?? undefined,
          leafletType: data.content?.leafletType ?? undefined,
          fileUrl: data.content?.fileUrl ?? undefined,
          assetNote: data.content?.assetNote ?? undefined,
        }
        form.setFieldsValue(init)
      } catch {}
      setLoading(false)
    }
    if (id) load()
  }, [id])

  const onFinish = async (values: any) => {
    setSaving(true)
    try {
      const payload: any = {
        type: values.type,
        status: values.status,
        priority: values.priority,
        salesId: Number(values.salesId),
        designerId: values.designerId ? Number(values.designerId) : null,
      }
      payload.content = {
        category: values.category,
        brand: values.brand || null,
        baseColor: values.baseColor || null,
        position: values.position || null,
        size: values.size || null,
        leafletType: values.leafletType || null,
        fileUrl: values.fileUrl || null,
        assetNote: values.assetNote || null,
      }

      const res = await fetch(`/api/design-orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('更新失敗')
      message.success('已更新')
      router.push('/design-orders')
    } catch (e: any) {
      message.error(e.message || '發生錯誤')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ padding: 20, maxWidth: 720 }}>
      <h2>編輯設計單</h2>
      {!loading && (
        <Form layout="vertical" form={form} onFinish={onFinish}>
          <Form.Item label="設計單類型" name="type" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio.Button value="new">設計新增單</Radio.Button>
              <Radio.Button value="edit">設計修改單</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item label="內容類別" name="category" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio.Button value="clothes">衣服</Radio.Button>
              <Radio.Button value="leaflet">文宣</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Space direction="vertical" style={{ width: '100%' }}>
            <Form.Item label="品牌" name="brand">
              <Input />
            </Form.Item>
            <Form.Item label="底色" name="baseColor">
              <Input />
            </Form.Item>
            <Form.Item label="圖案位置" name="position">
              <Input />
            </Form.Item>
            <Form.Item label="圖案大小" name="size">
              <Input />
            </Form.Item>
            <Form.Item label="文宣類型" name="leafletType">
              <Input />
            </Form.Item>
            <Form.Item label="圖片/連結與說明（可拖曳/貼上圖片）" name="assetNote">
              <Input.TextArea 
                rows={4} 
                placeholder="可貼上圖片 URL、雲端連結、或描述說明；支援拖曳/貼上圖片"
                onPaste={async (e) => {
                  const items = e.clipboardData?.items
                  if (!items) return
                  const files: File[] = []
                  for (let i = 0; i < items.length; i++) {
                    const item = items[i]
                    if (item.kind === 'file') {
                      const file = item.getAsFile()
                      if (file && file.type.startsWith('image/')) files.push(file)
                    }
                  }
                  if (files.length) {
                    e.preventDefault()
                    const urls = await filesToDataUrls(files)
                    appendToAssetNote(urls)
                  }
                }}
                onDrop={async (e) => {
                  e.preventDefault()
                  const dt = e.dataTransfer
                  if (!dt?.files?.length) return
                  const images = Array.from(dt.files).filter(f => f.type.startsWith('image/'))
                  if (!images.length) return
                  const urls = await filesToDataUrls(images)
                  appendToAssetNote(urls)
                }}
                onDragOver={(e) => e.preventDefault()}
              />
            </Form.Item>
            {previewSrc && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>預覽：</div>
                <img src={previewSrc} alt="預覽" style={{ maxWidth: 260, border: '1px solid #eee', borderRadius: 6 }} />
              </div>
            )}
          </Space>

          <Form.Item label="狀態" name="status" rules={[{ required: true }]}>
            <Select options={[
              { value: 'pending', label: '未處理' },
              { value: 'processing', label: '進行中' },
              { value: 'review', label: '待確認' },
              { value: 'done', label: '已完成' },
            ]} />
          </Form.Item>

          <Form.Item label="優先級" name="priority" rules={[{ required: true }]}>
            <Select options={[
              { value: 'high', label: '高' },
              { value: 'medium', label: '中' },
              { value: 'low', label: '低' },
            ]} />
          </Form.Item>

          <Space size="middle" style={{ width: '100%' }}>
            <Form.Item label="業務ID" name="salesId" rules={[{ required: true }]}>
              <Input type="number" min={1} />
            </Form.Item>
            <Form.Item label="設計師ID" name="designerId">
              <Input type="number" min={1} />
            </Form.Item>
          </Space>

          <Space>
            <Button htmlType="button" onClick={() => router.back()}>取消</Button>
            <Button type="primary" htmlType="submit" loading={saving}>儲存</Button>
          </Space>
        </Form>
      )}
    </div>
  )
}


