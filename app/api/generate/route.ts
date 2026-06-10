import { NextRequest, NextResponse } from 'next/server'
import { compute } from '@/lib/pricing'
import { generateXLSX } from '@/lib/generators/xlsx'
import { generateDOCX } from '@/lib/generators/docx'
import type { ProjectData } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const { projectData } = (await req.json()) as { projectData: ProjectData }

    const result = compute(projectData)
    const xlsxBuf = generateXLSX(projectData, result)
    const docxBuf = await generateDOCX(projectData, result)

    return NextResponse.json({
      xlsx_base64: xlsxBuf.toString('base64'),
      docx_base64: docxBuf.toString('base64'),
      summary: {
        total_cost: result.total_cost,
        selling_price: result.selling_price,
        final_total: result.final_total,
        commercial_area: result.derived.commercial_area,
      },
    })
  } catch (err) {
    console.error('[/api/generate]', err)
    return NextResponse.json({ error: 'File generation failed.' }, { status: 500 })
  }
}
