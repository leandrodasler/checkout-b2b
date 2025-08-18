const SCALE = 2
const JPEG_QUALITY = 0.92

export async function elementToPdfBlob(element: HTMLElement): Promise<Blob> {
  const { cloned, width, height } = cloneWithInlineStyles(element)
  const svg = makeForeignObjectSVG(cloned, width, height)
  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  const img = await loadImage(dataUrl)
  const canvas = document.createElement('canvas')

  canvas.width = Math.max(1, Math.floor(width * SCALE))
  canvas.height = Math.max(1, Math.floor(height * SCALE))
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

  ctx.imageSmoothingEnabled = true
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  const jpegDataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY)
  const jpegBytes = dataURLToUint8Array(jpegDataUrl)
  const pdfBytes = buildSingleImagePdf({
    img: jpegBytes,
    imgWidth: canvas.width,
    imgHeight: canvas.height,
  })

  return new Blob([pdfBytes.slice().buffer], { type: 'application/pdf' })
}

function cloneWithInlineStyles(sourceEl: HTMLElement) {
  const rect = sourceEl.getBoundingClientRect()
  const cloned = sourceEl.cloneNode(true) as HTMLElement

  const copyStyles = (src: Element, dest: Element, isRoot = false) => {
    const cs = getComputedStyle(src)
    const { style } = dest as HTMLElement

    for (let i = 0; i < cs.length; i++) {
      const prop = cs[i]

      try {
        if (
          prop === 'overflow' ||
          prop === 'text-overflow' ||
          prop === 'white-space'
        ) {
          continue
        }

        style.setProperty(
          prop,
          cs.getPropertyValue(prop),
          cs.getPropertyPriority(prop)
        )

        style.setProperty('font-size', '10px', 'important')
      } catch {
        // ignore
      }
    }

    if (src instanceof HTMLInputElement && dest instanceof HTMLInputElement) {
      dest.value = src.value
      if (src.type === 'checkbox' || src.type === 'radio') {
        dest.checked = src.checked
      }
    }

    if (
      src instanceof HTMLTextAreaElement &&
      dest instanceof HTMLTextAreaElement
    ) {
      dest.value = src.value
    }

    if (src instanceof HTMLButtonElement && dest instanceof HTMLButtonElement) {
      dest.style.display = 'none'
    }

    if (src instanceof HTMLSelectElement && dest instanceof HTMLSelectElement) {
      dest.value = src.value
    }

    if (isRoot && dest instanceof HTMLElement) {
      dest.style.backgroundColor = 'white'
    }

    const srcChildren = Array.from(src.children)
    const destChildren = Array.from(dest.children)

    for (let i = 0; i < srcChildren.length; i++) {
      copyStyles(srcChildren[i], destChildren[i])
    }
  }

  copyStyles(sourceEl, cloned, true)

  cloned.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml')
  cloned.style.width = `${Math.max(1, Math.ceil(rect.width))}px`
  cloned.style.height = `${Math.max(1, Math.ceil(rect.height))}px`

  return {
    cloned,
    width: Math.max(1, Math.ceil(rect.width)),
    height: Math.max(1, Math.ceil(rect.height)),
  }
}

function makeForeignObjectSVG(node: HTMLElement, w: number, h: number): string {
  const serializer = new XMLSerializer()
  const xhtml = serializer.serializeToString(node)

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <foreignObject width="100%" height="100%">
    ${xhtml}
  </foreignObject>
</svg>`.trim()
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => resolve(img)
    img.onerror = (e) => reject(e)
    img.src = src
  })
}

function dataURLToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1] ?? ''
  const binary = atob(base64)
  const len = binary.length
  const bytes = new Uint8Array(len)

  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i)

  return bytes
}

function buildSingleImagePdf(params: {
  img: Uint8Array
  imgWidth: number
  imgHeight: number
}): Uint8Array {
  const { img, imgWidth, imgHeight } = params

  const objects: string[] = []

  objects.push(`1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
`)

  objects.push(`2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
`)

  const mediaBox = `0 0 ${imgWidth.toFixed(2)} ${imgHeight.toFixed(2)}`

  objects.push(`3 0 obj
<< /Type /Page
   /Parent 2 0 R
   /MediaBox [${mediaBox}]
   /Resources << /ProcSet [/PDF /ImageC] /XObject << /Im0 4 0 R >> >>
   /Contents 5 0 R
>>
endobj
`)

  const imgLength = img.byteLength
  const imgObjHeader = `4 0 obj
<< /Type /XObject
   /Subtype /Image
   /Width ${imgWidth}
   /Height ${imgHeight}
   /ColorSpace /DeviceRGB
   /BitsPerComponent 8
   /Filter /DCTDecode
   /Length ${imgLength}
>>
stream
`

  const imgObjFooter = `
endstream
endobj
`

  const contentStream = `q
${imgWidth.toFixed(2)} 0 0 ${imgHeight.toFixed(2)} 0 0 cm
/Im0 Do
Q
`

  const contentBytes = new TextEncoder().encode(contentStream)
  const contentObj = `5 0 obj
<< /Length ${contentBytes.length} >>
stream
${contentStream}endstream
endobj
`

  const header = `%PDF-1.4
%âãÏÓ
`

  const encoder = new TextEncoder()
  const chunks: Array<Uint8Array | 'IMG'> = []
  const offsets: number[] = []
  let pos = 0

  const pushText = (s: string) => {
    const bytes = encoder.encode(s)

    chunks.push(bytes)
    pos += bytes.length
  }

  const pushImg = (bin: Uint8Array) => {
    chunks.push('IMG')
    pos += bin.byteLength
  }

  pushText(header)

  offsets.push(pos)
  pushText(objects[0])
  offsets.push(pos)
  pushText(objects[1])
  offsets.push(pos)
  pushText(objects[2])
  offsets.push(pos)
  pushText(imgObjHeader)
  pushImg(img)
  pushText(imgObjFooter)
  offsets.push(pos)
  pushText(contentObj)

  const xrefStart = pos
  const totalObjs = 5
  let xref = `xref
0 ${totalObjs + 1}
0000000000 65535 f 
`

  for (let i = 0; i < totalObjs; i++) {
    const off = offsets[i]

    xref += `${off.toString().padStart(10, '0')} 00000 n \n`
  }

  const trailer = `trailer
<< /Size ${totalObjs + 1} /Root 1 0 R >>
startxref
${xrefStart}
%%EOF
`

  const totalSize =
    chunks.reduce(
      (acc, c) =>
        acc + (c === 'IMG' ? img.byteLength : (c as Uint8Array).byteLength),
      0
    ) +
    encoder.encode(xref).length +
    encoder.encode(trailer).length

  const out = new Uint8Array(totalSize)
  let offset = 0

  for (const c of chunks) {
    if (c === 'IMG') {
      out.set(img, offset)
      offset += img.byteLength
    } else {
      out.set(c, offset)
      offset += c.byteLength
    }
  }

  const xrefBytes = encoder.encode(xref)

  out.set(xrefBytes, offset)
  offset += xrefBytes.length

  const trailerBytes = encoder.encode(trailer)

  out.set(trailerBytes, offset)
  offset += trailerBytes.length

  return out
}
