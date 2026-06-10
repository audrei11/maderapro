export async function parseMSG(buffer: Buffer): Promise<string> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const MsgReader = require('msgreader').default
    const reader = new MsgReader(buffer)
    const msg = reader.getFileData()

    const parts: string[] = []

    if (msg.subject) parts.push(`Subject: ${msg.subject}`)
    if (msg.senderName) parts.push(`From: ${msg.senderName}`)
    if (msg.senderEmail) parts.push(`Email: ${msg.senderEmail}`)

    const body = msg.body || msg.bodyHtml || ''
    if (body) {
      // strip HTML tags if needed
      const clean = body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      parts.push('', clean)
    }

    return parts.join('\n')
  } catch (err) {
    console.error('[msg-parser] failed:', err)
    return ''
  }
}
