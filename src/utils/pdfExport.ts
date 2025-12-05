import jsPDF from 'jspdf';
import type { Database } from '../lib/database.types';

type UserProfile = Database['public']['Tables']['users']['Row'];
type Saison = Database['public']['Tables']['saisons']['Row'];

export function exportRapportToPDF(
  collaborator: UserProfile,
  saison: Saison,
  content: string,
  status: string
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Rapport d\'évaluation annuelle', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Collaborateur: ${collaborator.first_name} ${collaborator.last_name}`, margin, yPosition);
  yPosition += 8;
  doc.text(`Poste: ${collaborator.role.replace('_', ' ')}`, margin, yPosition);
  yPosition += 8;
  doc.text(`Saison: ${saison.name}`, margin, yPosition);
  yPosition += 8;
  doc.text(`Statut: ${status === 'VALIDATED' ? 'Validé' : 'Brouillon'}`, margin, yPosition);
  yPosition += 15;

  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const lines = content.split('\n');

  for (const line of lines) {
    if (yPosition > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }

    if (line.trim() === '') {
      yPosition += 5;
      continue;
    }

    if (line.startsWith('##')) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      const text = line.replace(/^##\s*/, '');
      const splitText = doc.splitTextToSize(text, maxWidth);
      doc.text(splitText, margin, yPosition);
      yPosition += splitText.length * 7 + 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
    } else if (line.startsWith('#')) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      const text = line.replace(/^#\s*/, '');
      const splitText = doc.splitTextToSize(text, maxWidth);
      doc.text(splitText, margin, yPosition);
      yPosition += splitText.length * 8 + 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
    } else if (line.startsWith('*') || line.startsWith('-')) {
      const text = '  • ' + line.replace(/^[*-]\s*/, '');
      const splitText = doc.splitTextToSize(text, maxWidth - 5);
      doc.text(splitText, margin, yPosition);
      yPosition += splitText.length * 5 + 3;
    } else {
      const cleanText = line.replace(/\*\*/g, '');
      const splitText = doc.splitTextToSize(cleanText, maxWidth);
      doc.text(splitText, margin, yPosition);
      yPosition += splitText.length * 5 + 3;
    }
  }

  yPosition += 20;
  if (yPosition > pageHeight - margin - 20) {
    doc.addPage();
    yPosition = margin;
  }

  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  doc.text(`Document généré le ${currentDate}`, margin, yPosition);

  const filename = `rapport_${collaborator.last_name}_${saison.name.replace(/[^a-z0-9]/gi, '_')}.pdf`;
  doc.save(filename);
}
