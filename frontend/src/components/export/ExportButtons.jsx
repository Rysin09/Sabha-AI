/**
 * ExportButtons — PDF and TXT download buttons
 */
import { Download, FileText } from 'lucide-react'
import { getPdfUrl, getTxtUrl } from '../../services/api'

export function ExportButtons({ jobId }) {
  return (
    <div className="flex items-center gap-2" id="export-buttons">
      <a
        href={getPdfUrl(jobId)}
        download
        className="btn-secondary flex items-center gap-2 text-sm py-2 px-4"
        id="export-pdf-btn"
      >
        <Download size={14} />
        PDF
      </a>
      <a
        href={getTxtUrl(jobId)}
        download
        className="btn-secondary flex items-center gap-2 text-sm py-2 px-4"
        id="export-txt-btn"
      >
        <FileText size={14} />
        TXT
      </a>
    </div>
  )
}
