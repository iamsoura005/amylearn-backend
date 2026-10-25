import { useRef } from 'react';
import { jsPDF } from 'jspdf';
import QRCodeSVG from 'react-qr-code';
import Barcode from 'react-barcode';
import {
  BadgeCheck,
  CalendarDays,
  Clock3,
  Download,
  FileText,
  MapPin,
  Printer,
  QrCode,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SectionCard, formatDay } from './shared/StudentTabKit';
import { MOCK_ADMIT_CARD } from '@/pages/auth/campus-student/constants/campusStudentConstants';

const PRINT_STYLES = `
@media print {
  body * { visibility: hidden !important; }
  .admit-print-sheet, .admit-print-sheet * { visibility: visible !important; }
  .admit-print-sheet { position: absolute !important; left: 0; top: 0; width: 100%; margin: 0; border: none !important; box-shadow: none !important; }
  @page { size: A4; margin: 12mm; }
}
`;

export const StudentAdmitCardTab = ({ session, triggerPopup }) => {
  const sheetRef = useRef(null);
  const student = session || {};
  const card = {
    ...MOCK_ADMIT_CARD,
    studentName: student.name || MOCK_ADMIT_CARD.studentName,
    rollNumber: student.rollNumber || MOCK_ADMIT_CARD.rollNumber,
    program: student.program || MOCK_ADMIT_CARD.program,
    semester: student.semester || MOCK_ADMIT_CARD.semester
  };

  const downloadPdf = () => {
    const doc = new jsPDF();
    doc.setFillColor(30, 99, 214);
    doc.rect(0, 0, 210, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('AmyLearn', 14, 18);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Northbridge University · Admit card', 150, 18, { align: 'right' });
    doc.setTextColor(10, 31, 68);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(card.examName, 14, 42);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const details = [
      ['Student', card.studentName],
      ['Roll number', card.rollNumber],
      ['Programme', card.program],
      ['Semester', String(card.semester)],
      ['Centre', card.centre],
      ['Seat', card.seatNumber],
      ['Reporting time', card.reportingTime]
    ];
    details.forEach(([label, value], index) => {
      doc.setTextColor(100, 116, 139);
      doc.text(label, 14, 54 + index * 8);
      doc.setTextColor(10, 31, 68);
      doc.setFont('helvetica', 'bold');
      doc.text(String(value), 55, 54 + index * 8);
      doc.setFont('helvetica', 'normal');
    });
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Registered papers', 14, 122);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    card.papers.forEach((paper, index) => {
      doc.text(`${paper.code}  ${paper.title}`, 14, 132 + index * 7);
      doc.text(`${formatDay(paper.date, 'd MMM yyyy')} · ${paper.time}`, 160, 132 + index * 7);
    });
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Verify authenticity by scanning the QR code on the portal. This document is provisional until fees are reconciled.', 14, 280);
    doc.save(`amylearn-admit-card-${card.rollNumber}.pdf`);
    triggerPopup?.('Admit card downloaded as PDF.', 'success');
  };

  return (
    <div className="space-y-4">
      <style>{PRINT_STYLES}</style>
      <PageHeader
        eyebrow="Examinations office"
        title="Admit card"
        description="QR-verified hall ticket for the odd semester examinations. Carry a printed copy and your campus ID."
        icon={FileText}
        tone="rose"
        actions={
          <>
            <Button variant="white" size="sm" icon={Printer} onClick={() => window.print()}>
              Print
            </Button>
            <Button size="sm" icon={Download} onClick={downloadPdf}>
              Download PDF
            </Button>
          </>
        }
      />

      <div className="grid gap-3 xl:grid-cols-4">
        <div className="space-y-3 xl:col-span-3">
          <div ref={sheetRef} className="admit-print-sheet overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-bento">
            <div className="bg-gradient-to-r from-[#0A1F44] via-[#123a82] to-[#1E63D6] px-4 py-3 text-white sm:px-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/60">AmyLearn examinations</p>
                  <p className="mt-0.5 text-lg font-extrabold font-jost">Northbridge University</p>
                  <p className="text-[9px] font-semibold text-white/70">Bengaluru · NAAC A+ · Institution code NBR</p>
                </div>
                <div className="rounded-xl bg-white/12 px-2.5 py-1.5 text-right backdrop-blur">
                  <p className="text-[8px] font-bold uppercase tracking-wide text-white/60">Document</p>
                  <p className="text-[10px] font-extrabold">ADMIT CARD</p>
                  <p className="text-[8px] font-semibold text-white/70">Odd 2026</p>
                </div>
              </div>
            </div>

            <div className="border-b border-dashed border-slate-200 px-4 py-3 sm:px-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="grid h-16 w-14 shrink-0 place-items-center rounded-lg border border-slate-200 bg-slate-50">
                    <span className="text-lg font-extrabold text-slate-400 font-jost">{card.photoInitials}</span>
                    <span className="text-[6px] font-bold uppercase tracking-wide text-slate-500">Photo</span>
                  </div>
                  <div>
                    <p className="text-[15px] font-extrabold leading-tight text-deepNavy font-jost">{card.studentName}</p>
                    <p className="mt-0.5 text-[10px] font-bold text-brandBlue">{card.rollNumber}</p>
                    <p className="text-[9px] font-semibold text-slate-500">{card.program}</p>
                    <p className="text-[9px] font-semibold text-slate-500">Semester {card.semester} · Section A</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-lg border border-slate-200 bg-white p-1.5">
                    <QRCodeSVG value={card.qrValue} size={78} bgColor="#ffffff" fgColor="#0A1F44" />
                  </div>
                  <div className="hidden flex-col items-center sm:flex">
                    <div className="rounded bg-white p-1">
                      <Barcode value={card.barcodeValue} height={34} width={1} fontSize={8} margin={0} displayValue={false} background="#ffffff" lineColor="#0A1F44" />
                    </div>
                    <p className="mt-1 text-[7px] font-bold uppercase tracking-wide text-slate-500">Scan to verify</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-4 py-3 sm:px-5">
              <p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">{card.examName}</p>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { icon: MapPin, label: 'Exam centre', value: card.centre, hint: card.centreCode },
                  { icon: BadgeCheck, label: 'Seat number', value: card.seatNumber, hint: card.room },
                  { icon: Clock3, label: 'Reporting time', value: card.reportingTime, hint: 'Reach 30 min early' },
                  { icon: CalendarDays, label: 'Papers', value: `${card.papers.length} papers`, hint: '9 – 20 November' }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-xl border border-slate-100 bg-slate-50/60 px-2.5 py-2">
                      <p className="flex items-center gap-1 text-[7.5px] font-bold uppercase tracking-wide text-slate-500">
                        <Icon size={9} /> {item.label}
                      </p>
                      <p className="mt-0.5 text-[9.5px] font-extrabold leading-snug text-deepNavy">{item.value}</p>
                      <p className="text-[8px] font-semibold text-slate-500">{item.hint}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
                <div className="grid grid-cols-12 bg-slate-50 px-2.5 py-1.5 text-[8px] font-bold uppercase tracking-wide text-slate-500">
                  <span className="col-span-2">Code</span>
                  <span className="col-span-5">Paper</span>
                  <span className="col-span-3">Date</span>
                  <span className="col-span-2 text-right">Session</span>
                </div>
                {card.papers.map((paper) => (
                  <div key={paper.code} className="grid grid-cols-12 items-center border-t border-slate-100 px-2.5 py-1.5 text-[9px]">
                    <span className="col-span-2 font-extrabold text-brandBlue">{paper.code}</span>
                    <span className="col-span-5 truncate font-bold text-deepNavy">{paper.title}</span>
                    <span className="col-span-3 font-semibold text-slate-500">{formatDay(paper.date, 'd MMM yyyy')}</span>
                    <span className="col-span-2 text-right font-semibold text-slate-500 tabular">{paper.time}</span>
                  </div>
                ))}
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-wide text-slate-500">Instructions</p>
                  <ul className="mt-1 space-y-0.5">
                    {card.instructions.map((instruction, index) => (
                      <li key={instruction} className="flex gap-1 text-[8px] leading-relaxed text-slate-500">
                        <span className="font-bold text-slate-500">{index + 1}.</span>
                        {instruction}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col items-end justify-end gap-3">
                  <div className="w-36 border-t border-slate-300 pt-1 text-center">
                    <p className="text-[7px] font-bold uppercase tracking-wide text-slate-500">Controller of examinations</p>
                  </div>
                  <p className="text-right text-[7px] font-semibold text-slate-500">
                    Generated 24 Oct 2026 · {card.rollNumber} · v1
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2.5">
            <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-600" />
            <p className="text-[9.5px] font-semibold leading-relaxed text-amber-800">
              This admit card is provisional. It is valid only after the examination fee ledger is fully reconciled. Report
              discrepancies to the examinations office at least 48 hours before your first paper.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <SectionCard title="Verification" icon={QrCode} tone="indigo" bodyClassName="p-3.5">
            <div className="flex items-center gap-2 rounded-xl bg-indigo-50 px-2.5 py-2">
              <ShieldCheck size={15} className="text-indigo-600" />
              <div>
                <p className="text-[9.5px] font-bold text-indigo-900">QR verified</p>
                <p className="text-[8px] font-semibold text-indigo-700/80">Checked against the exams registry</p>
              </div>
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between py-1 text-[9px]">
                <span className="font-semibold text-slate-500">Exam session</span>
                <span className="font-bold text-deepNavy">Odd 2026</span>
              </div>
              <div className="flex items-center justify-between py-1 text-[9px]">
                <span className="font-semibold text-slate-500">Centre code</span>
                <span className="font-bold text-deepNavy">{card.centreCode}</span>
              </div>
              <div className="flex items-center justify-between py-1 text-[9px]">
                <span className="font-semibold text-slate-500">Fee status</span>
                <Badge tone="emerald">Exam fee paid</Badge>
              </div>
              <div className="flex items-center justify-between py-1 text-[9px]">
                <span className="font-semibold text-slate-500">Attendance</span>
                <span className="font-bold text-deepNavy">87%</span>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Paper checklist" description="What to carry" icon={FileText} tone="emerald" bodyClassName="p-3">
            <div className="space-y-1.5">
              {['Printed admit card', 'Campus ID card', 'Blue or black pens', 'Transparent water bottle'].map((item) => (
                <div key={item} className="flex items-center gap-2 text-[9.5px] font-semibold text-slate-600">
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                    <BadgeCheck size={9} />
                  </span>
                  {item}
                </div>
              ))}
            </div>
            <p className="mt-2 rounded-lg bg-rose-50 px-2 py-1.5 text-[8.5px] font-semibold text-rose-700">
              Not permitted: phones, smart watches, programmable calculators.
            </p>
          </SectionCard>

          <SectionCard title="Need help?" description="Examinations office" icon={ShieldCheck} tone="rose" bodyClassName="p-3.5">
            <p className="text-[9.5px] leading-relaxed text-slate-500">
              Raise a ticket from the help menu or visit the exams desk on the second floor of the admin block, 10:00 AM –
              4:00 PM on weekdays.
            </p>
            <p className="mt-2 text-[10px] font-bold text-rose-700">exams@amylearn.demo</p>
            <p className="text-[9px] font-semibold text-slate-500">+91 80 4123 9080</p>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default StudentAdmitCardTab;
