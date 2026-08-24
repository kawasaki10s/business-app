import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import React from 'react';
import { prisma } from '@/lib/db';
import { requirePermission, UnauthenticatedError, UnauthorizedError } from '@/lib/permissions';
import { formatUZS } from '@/lib/serialize';

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, color: '#3B3028' },
  title: { fontSize: 18, marginBottom: 4, color: '#4B3621' },
  subtitle: { fontSize: 10, marginBottom: 16, color: '#6F6258' },
  sectionTitle: { fontSize: 13, marginTop: 16, marginBottom: 6, color: '#6F4E37' },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#D1C3AE', paddingVertical: 4 },
  cell: { flex: 1 },
  headerRow: { flexDirection: 'row', backgroundColor: '#E9E4D4', paddingVertical: 4 },
  headerCell: { flex: 1, fontWeight: 700 },
});

export async function GET(req: NextRequest) {
  try {
    await requirePermission('EXPORT_REPORTS');
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from') ? new Date(searchParams.get('from')!) : new Date(0);
    const to = searchParams.get('to') ? new Date(searchParams.get('to')!) : new Date();

    const business = await prisma.business.findFirst();
    const investors = await prisma.user.findMany({
      where: { role: 'INVESTOR' },
      include: { ownership: true, investment: true, balance: true },
    });
    const loans = await prisma.transaction.findMany({
      where: { type: 'LOAN', createdAt: { gte: from, lte: to } },
      include: { initiator: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const doc = React.createElement(
      Document,
      {},
      React.createElement(
        Page,
        { size: 'A4', style: styles.page },
        React.createElement(Text, { style: styles.title }, business?.name ?? 'Biznes hisobot'),
        React.createElement(
          Text,
          { style: styles.subtitle },
          `Hisobot davri: ${from.toLocaleDateString('uz-UZ')} — ${to.toLocaleDateString('uz-UZ')} | Joriy biznes qiymati: ${formatUZS(business?.currentValue ?? 0n)}`
        ),
        React.createElement(Text, { style: styles.sectionTitle }, 'Investorlar'),
        React.createElement(
          View,
          {},
          React.createElement(
            View,
            { style: styles.headerRow },
            React.createElement(Text, { style: styles.headerCell }, 'Ism'),
            React.createElement(Text, { style: styles.headerCell }, 'Ulush'),
            React.createElement(Text, { style: styles.headerCell }, "Investitsiya"),
            React.createElement(Text, { style: styles.headerCell }, 'Schot')
          ),
          ...investors.map((inv) =>
            React.createElement(
              View,
              { style: styles.row, key: inv.id },
              React.createElement(Text, { style: styles.cell }, inv.name),
              React.createElement(Text, { style: styles.cell }, inv.ownership ? `${inv.ownership.numerator}/${inv.ownership.denominator}` : '-'),
              React.createElement(Text, { style: styles.cell }, formatUZS(inv.investment?.initialAmount ?? 0n)),
              React.createElement(Text, { style: styles.cell }, formatUZS(inv.balance?.currentAmount ?? 0n))
            )
          )
        ),
        React.createElement(Text, { style: styles.sectionTitle }, 'Qarz tranzaksiyalari'),
        React.createElement(
          View,
          {},
          React.createElement(
            View,
            { style: styles.headerRow },
            React.createElement(Text, { style: styles.headerCell }, 'Sana'),
            React.createElement(Text, { style: styles.headerCell }, 'Kim'),
            React.createElement(Text, { style: styles.headerCell }, 'Summa')
          ),
          ...loans.map((l) =>
            React.createElement(
              View,
              { style: styles.row, key: l.id },
              React.createElement(Text, { style: styles.cell }, l.createdAt.toLocaleDateString('uz-UZ')),
              React.createElement(Text, { style: styles.cell }, l.initiator.name),
              React.createElement(Text, { style: styles.cell }, formatUZS(l.amount))
            )
          )
        )
      )
    );

    const buffer = await renderToBuffer(doc as any);
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="report-${Date.now()}.pdf"`,
      },
    });
  } catch (err) {
    if (err instanceof UnauthenticatedError) return NextResponse.json({ error: err.message }, { status: 401 });
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: err.message }, { status: 403 });
    console.error(err);
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}
