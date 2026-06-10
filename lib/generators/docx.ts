import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, BorderStyle, AlignmentType, HeadingLevel, ShadingType,
} from 'docx'
import type { ProjectData, ComputationResult } from '../types'

function bold(text: string) {
  return new TextRun({ text, bold: true })
}

function cell(text: string, options?: { bold?: boolean; shade?: boolean; width?: number }) {
  return new TableCell({
    width: options?.width ? { size: options.width, type: WidthType.PERCENTAGE } : undefined,
    shading: options?.shade ? { type: ShadingType.SOLID, color: '1F3864', fill: '1F3864' } : undefined,
    children: [new Paragraph({
      children: [new TextRun({
        text,
        bold: options?.bold ?? false,
        color: options?.shade ? 'FFFFFF' : undefined,
        size: 20,
      })],
    })],
  })
}

function headerRow(labels: string[]) {
  return new TableRow({
    children: labels.map((l) => cell(l, { bold: true, shade: true })),
    tableHeader: true,
  })
}

const BORDER = {
  top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
  left: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
  right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
}

export async function generateDOCX(data: ProjectData, result: ComputationResult): Promise<Buffer> {
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })

  const doc = new Document({
    sections: [{
      children: [
        // ── Header info ──────────────────────────────────────────
        new Paragraph({ children: [bold('To:')], spacing: { after: 0 } }),
        new Paragraph({ children: [new TextRun(data.architect_firm.value ?? '')], spacing: { after: 0 } }),
        new Paragraph({ children: [new TextRun(data.project_address.value ?? '')], spacing: { after: 120 } }),
        new Paragraph({ children: [bold('Att.:')], spacing: { after: 0 } }),
        new Paragraph({ children: [new TextRun(data.architect_contacts.value ?? '')], spacing: { after: 240 } }),

        new Paragraph({
          children: [bold('End client:'), new TextRun(`\t\t${data.client_name.value ?? ''}`)],
          spacing: { after: 0 },
        }),
        new Paragraph({
          children: [bold('Site:'), new TextRun(`\t\t\t${data.site_name.value ?? ''}`)],
          spacing: { after: 0 },
        }),
        new Paragraph({
          children: [bold('Date:'), new TextRun(`\t\t\t${today}`)],
          spacing: { after: 0 },
        }),
        new Paragraph({
          children: [bold('Offer drafted by:'), new TextRun('\t\tJavier Soler')],
          spacing: { after: 0 },
        }),
        new Paragraph({
          children: [new TextRun('\t\t\t\tjavier@maderapro.example')],
          spacing: { after: 0 },
        }),
        new Paragraph({
          children: [new TextRun('\t\t\t\t+34 600 000 000')],
          spacing: { after: 480 },
        }),

        // ── Subject ───────────────────────────────────────────────
        new Paragraph({
          children: [new TextRun({ text: 'SUBJECT: Supply and on-site assembly of a wooden-structure villa', bold: true, size: 24 })],
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [new TextRun('With reference to your kind request, please find below our best offer for the design, supply and on-site assembly of the works described hereunder.')],
          spacing: { after: 400 },
        }),

        // ── Section 1 ─────────────────────────────────────────────
        new Paragraph({ text: '1. GENERAL INFORMATION', heading: HeadingLevel.HEADING_1, spacing: { after: 200 } }),
        new Paragraph({ text: '1.1 Dimensional characteristics', heading: HeadingLevel.HEADING_2, spacing: { after: 160 } }),

        // Dimensions table
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            headerRow(['Description', 'm2 (*)', 'Coeff', 'm2 commercial', 'Slab check m2']),
            ...data.floors.map((f) => new TableRow({
              children: [
                cell(f.name, { bold: true }),
                cell(f.habitable_m2.toFixed(0)),
                cell('100%'),
                cell(f.habitable_m2.toFixed(0)),
                cell(f.habitable_m2 > 0 ? f.habitable_m2.toFixed(0) : ''),
              ],
            })),
            ...(data.floors.some((f) => f.terrace_m2 > 0) ? data.floors.filter((f) => f.terrace_m2 > 0).map((f) => new TableRow({
              children: [
                cell(`${f.name} - terrace`, { bold: true }),
                cell(f.terrace_m2.toFixed(0)),
                cell('30%'),
                cell((f.terrace_m2 * 0.3).toFixed(0)),
                cell(f.terrace_m2.toFixed(0)),
              ],
            })) : []),
            new TableRow({
              children: [
                cell('Roof', { bold: true }),
                cell((data.roof_m2.value ?? 0).toFixed(0)),
                cell('0%'),
                cell('0'),
                cell((data.roof_m2.value ?? 0).toFixed(0)),
              ],
            }),
          ],
        }),

        new Paragraph({
          children: [new TextRun({ text: '(*) Areas measured from the architectural drawings supplied by the client.', italics: true, size: 18 })],
          spacing: { before: 100, after: 80 },
        }),

        // ── Section 1.2 ───────────────────────────────────────────
        new Paragraph({ text: '1.2 Structural design of the wooden structures', heading: HeadingLevel.HEADING_2, spacing: { before: 320, after: 160 } }),
        new Paragraph({ children: [new TextRun('• Structural calculation according to Limit State Design (ULS and SLS)')], spacing: { after: 80 } }),
        new Paragraph({ children: [new TextRun('• Construction drawings and connection details')], spacing: { after: 200 } }),

        // ── Section 1.3 ───────────────────────────────────────────
        new Paragraph({ text: '1.3 Normative reference (by priority)', heading: HeadingLevel.HEADING_2, spacing: { after: 160 } }),
        new Paragraph({ children: [new TextRun('• Eurocode 5 - EN 1995-1-1 (design of timber structures)')], spacing: { after: 80 } }),
        new Paragraph({ children: [new TextRun('• Eurocode 1 - EN 1991 (actions on structures)')], spacing: { after: 80 } }),
        new Paragraph({ children: [new TextRun('• EN 14080:2013 - Requirements for glued laminated timber')], spacing: { after: 400 } }),

        // ── Section 2: Pricing ────────────────────────────────────
        new Paragraph({ text: '2. PRICING SUMMARY', heading: HeadingLevel.HEADING_1, spacing: { after: 200 } }),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            headerRow(['Category', 'Description', 'Total (EUR)']),
            new TableRow({ children: [cell('STR'), cell('Structure (load-bearing timber, beams, slabs)'), cell(`€ ${result.subtotals.STR.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`)] }),
            new TableRow({ children: [cell('ENV'), cell('Envelope (insulation, facade, roof package)'), cell(`€ ${result.subtotals.ENV.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`)] }),
            new TableRow({ children: [cell('WIN'), cell('Windows, shutters, doors'), cell(`€ ${result.subtotals.WIN.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`)] }),
            new TableRow({ children: [cell('SITE'), cell('Site management (crane, scaffolding, engineering, labour)'), cell(`€ ${result.subtotals.SITE.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`)] }),
          ],
        }),

        new Paragraph({ spacing: { after: 120 } }),

        new Table({
          width: { size: 60, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [cell('TOTAL COST', { bold: true }), cell(`€ ${result.total_cost.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`, { bold: true })] }),
            new TableRow({ children: [cell(`Margin ${(result.margin_pct * 100).toFixed(0)}%`), cell('')] }),
            new TableRow({ children: [cell('SELLING PRICE (excl. VAT)', { bold: true }), cell(`€ ${result.selling_price.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`, { bold: true })] }),
            new TableRow({ children: [cell(`VAT ${(result.vat_pct * 100).toFixed(0)}%`), cell(`€ ${result.vat_amount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`)] }),
            new TableRow({ children: [cell('TOTAL incl. VAT', { bold: true, shade: true }), cell(`€ ${result.final_total.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`, { bold: true, shade: true })] }),
          ],
        }),

        new Paragraph({ spacing: { after: 400 } }),
        new Paragraph({ children: [new TextRun({ text: 'This offer is valid for 30 days from the date above. Prices are subject to final site inspection.', italics: true })] }),
      ],
    }],
  })

  return await Packer.toBuffer(doc)
}
