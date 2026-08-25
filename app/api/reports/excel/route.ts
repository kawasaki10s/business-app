import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { prisma } from '@/lib/db';
import { requirePermission, UnauthenticatedError, UnauthorizedError } from '@/lib/permissions';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requirePermission('EXPORT_REPORTS');

    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from') ? new Date(searchParams.get('from')!) : new Date(0);
    const to = searchParams.get('to') ? new Date(searchParams.get('to')!) : new Date();
    const sections = (searchParams.get('sections') ?? 'investors,investments,loans,balances,history,businessValueHistory').split(',');

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Business Management Platform';
    workbook.created = new Date();

    if (sections.includes('investors')) {
      const sheet = workbook.addWorksheet('Investorlar');
      sheet.columns = [
        { header: 'Ism', key: 'name', width: 25 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Ulush', key: 'ownership', width: 15 },
      ];
      const users = await prisma.user.findMany({ where: { role: 'INVESTOR' }, include: { ownership: true } });
      users.forEach((u) => sheet.addRow({ name: u.name, email: u.email, ownership: u.ownership ? `${u.ownership.numerator}/${u.ownership.denominator}` : '-' }));
    }

    if (sections.includes('investments')) {
      const sheet = workbook.addWorksheet('Investitsiyalar');
      sheet.columns = [
        { header: 'Investor', key: 'name', width: 25 },
        { header: 'Boshlang\'ich investitsiya (so\'m)', key: 'amount', width: 30 },
      ];
      const investments = await prisma.investment.findMany({ include: { user: true } });
      investments.forEach((i) => sheet.addRow({ name: i.user.name, amount: i.initialAmount.toString() }));
    }

    if (sections.includes('loans')) {
      const sheet = workbook.addWorksheet('Qarzlar');
      sheet.columns = [
        { header: 'Sana', key: 'date', width: 20 },
        { header: 'Kim', key: 'who', width: 20 },
        { header: 'Summa (so\'m)', key: 'amount', width: 20 },
        { header: 'Usul', key: 'method', width: 15 },
      ];
      const loans = await prisma.transaction.findMany({
        where: { type: 'LOAN', createdAt: { gte: from, lte: to } },
        include: { initiator: true },
        orderBy: { createdAt: 'desc' },
      });
      loans.forEach((l) => sheet.addRow({ date: l.createdAt.toISOString(), who: l.initiator.name, amount: l.amount.toString(), method: l.paymentMethodType }));
    }

    if (sections.includes('balances')) {
      const sheet = workbook.addWorksheet('Schotlar');
      sheet.columns = [
        { header: 'Investor', key: 'name', width: 25 },
        { header: 'Joriy schot (so\'m)', key: 'balance', width: 20 },
      ];
      const balances = await prisma.balance.findMany({ include: { user: true } });
      balances.forEach((b) => sheet.addRow({ name: b.user.name, balance: b.currentAmount.toString() }));
    }

    if (sections.includes('history')) {
      const sheet = workbook.addWorksheet('Umumiy tarix');
      sheet.columns = [
        { header: 'Sana', key: 'date', width: 20 },
        { header: 'Tur', key: 'type', width: 20 },
        { header: 'Kim', key: 'who', width: 20 },
        { header: 'Summa (so\'m)', key: 'amount', width: 20 },
      ];
      const txns = await prisma.transaction.findMany({
        where: { createdAt: { gte: from, lte: to } },
        include: { initiator: true },
        orderBy: { createdAt: 'desc' },
      });
      txns.forEach((t) => sheet.addRow({ date: t.createdAt.toISOString(), type: t.type, who: t.initiator.name, amount: t.amount.toString() }));
    }

    if (sections.includes('businessValueHistory')) {
      const sheet = workbook.addWorksheet('Biznes qiymati tarixi');
      sheet.columns = [
        { header: 'Sana', key: 'date', width: 20 },
        { header: 'Qiymat (so\'m)', key: 'value', width: 20 },
      ];
      const history = await prisma.businessValueHistory.findMany({
        where: { createdAt: { gte: from, lte: to } },
        orderBy: { createdAt: 'asc' },
      });
      history.forEach((h) => sheet.addRow({ date: h.createdAt.toISOString(), value: h.value.toString() }));
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="report-${Date.now()}.xlsx"`,
      },
    });
  } catch (err) {
    if (err instanceof UnauthenticatedError) return NextResponse.json({ error: err.message }, { status: 401 });
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: err.message }, { status: 403 });
    console.error(err);
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}
