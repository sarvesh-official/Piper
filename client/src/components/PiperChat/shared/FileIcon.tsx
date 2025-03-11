import { FileText, ScrollText, FileSpreadsheet, FileImage, FileCode } from "lucide-react"

interface FileIconProps {
  fileType: string
  className?: string
}

export function FileIcon({ fileType, className = "h-4 w-4" }: FileIconProps) {
  if (fileType.includes("pdf")) 
    return <FileText className={`${className} text-piper-darkblue dark:text-piper-lightblue`} />
  if (fileType.includes("doc")) 
    return <ScrollText className={`${className} text-piper-blue dark:text-piper-cyan`} />
  if (fileType.includes("csv") || fileType.includes("excel") || fileType.includes("sheet")) 
    return <FileSpreadsheet className={`${className} text-green-500`} />
  if (fileType.includes("image") || fileType.includes("png") || fileType.includes("jpg") || fileType.includes("jpeg")) 
    return <FileImage className={`${className} text-purple-600 dark:text-purple-500`} />
  if (fileType.includes("code") || fileType.includes("json") || fileType.includes("xml") || fileType.includes("html")) 
    return <FileCode className={`${className} text-yellow-500`} />
  return <FileText className={`${className} text-gray-500`} />
}
