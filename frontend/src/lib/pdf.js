import * as pdfjs from 'pdfjs-dist/build/pdf.mjs'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

// Worker phải trỏ tới file do Vite bundle, không lấy từ CDN — lớp học có thể offline.
pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

const documents = new Map()

/** Mỗi tài liệu chỉ tải một lần cho cả phiên; mọi trang dùng chung một instance. */
export function loadDocument(url) {
  if (!url) return Promise.reject(new Error('Chưa có đường dẫn tài liệu.'))
  if (!documents.has(url)) {
    documents.set(
      url,
      // pdf.js v6 chỉ đọc `src.url`: truyền thẳng chuỗi thì nó coi như không có nguồn
      // và ném "expected either `data`, `range`, or `url` parameter".
      pdfjs.getDocument({ url }).promise.catch((err) => {
        documents.delete(url) // hỏng thì lần sau còn thử lại được
        throw err
      })
    )
  }
  return documents.get(url)
}
