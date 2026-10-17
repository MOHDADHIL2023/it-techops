import { IncidentTicket, PriorityLevel, TicketStatus, TicketCategory } from '../types';

/**
 * Parses a CSV string into an array of string arrays,
 * properly handling commas inside quotes, escaped quotes, and multiline cells.
 */
export function parseCSV(text: string): string[][] {
  const p: string[][] = [];
  let row: string[] = [''];
  let inQuotes = false;
  let i = 0;

  // Strip UTF-8 BOM if present
  if (text.charCodeAt(0) === 0xFEFF) {
    text = text.slice(1);
  }

  while (i < text.length) {
    const c = text[i];
    const next = text[i + 1];

    if (c === '"') {
      if (inQuotes && next === '"') {
        // Escaped quote: "" -> "
        row[row.length - 1] += '"';
        i += 2;
        continue;
      }
      inQuotes = !inQuotes;
      i++;
      continue;
    }

    if (c === ',' && !inQuotes) {
      row.push('');
      i++;
      continue;
    }

    if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && next === '\n') {
        i++;
      }
      // End of row
      if (row.length > 1 || row[0] !== '') {
        p.push(row);
      }
      row = [''];
      i++;
      continue;
    }

    row[row.length - 1] += c;
    i++;
  }

  if (row.length > 1 || row[0] !== '') {
    p.push(row);
  }

  return p;
}

/**
 * Maps parsed CSV rows into IncidentTicket objects
 */
export function mapCsvRowsToTickets(rows: string[][]): {
  tickets: IncidentTicket[];
  errors: string[];
} {
  if (rows.length < 2) {
    return { tickets: [], errors: ['CSV file is empty or missing data rows.'] };
  }

  const rawHeaders = rows[0].map(h => h.trim().toLowerCase());
  const tickets: IncidentTicket[] = [];
  const errors: string[] = [];

  // Helper to find column index by matching aliases
  const findCol = (aliases: string[]) => {
    return rawHeaders.findIndex(h => aliases.some(a => h.includes(a)));
  };

  const idCol = findCol(['ticket id', 'id', 'ticket_id', 'ticket']);
  const titleCol = findCol(['title', 'summary', 'subject', 'name']);
  const assetIdCol = findCol(['asset id', 'asset_id', 'asset tag', 'tag']);
  const assetNameCol = findCol(['asset name', 'asset', 'system']);
  const priorityCol = findCol(['priority', 'severity', 'sla tier']);
  const statusCol = findCol(['status', 'state']);
  const categoryCol = findCol(['category', 'domain', 'type']);
  const descCol = findCol(['description', 'desc', 'details', 'problem']);
  const assignedCol = findCol(['assigned', 'specialist', 'custodian', 'owner']);
  const deptCol = findCol(['department', 'dept', 'team']);
  const rootCauseCol = findCol(['root cause', 'rootcause', 'rca']);
  const notesCol = findCol(['resolution', 'notes', 'remediation', 'actions']);
  const createdCol = findCol(['created', 'date', 'timestamp']);
  const slaTargetCol = findCol(['sla target', 'sla', 'target minutes']);

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (row.every(cell => !cell || cell.trim() === '')) continue;

    const rawTitle = titleCol >= 0 ? row[titleCol]?.trim() : '';
    const rawId = idCol >= 0 && row[idCol]?.trim() 
      ? row[idCol].trim() 
      : `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    if (!rawTitle && (!descCol || !row[descCol]?.trim())) {
      errors.push(`Row ${r + 1}: Skipped due to missing title and description.`);
      continue;
    }

    // Normalize priority
    let priority: PriorityLevel = 'Medium';
    const rawPriority = priorityCol >= 0 ? row[priorityCol]?.trim().toLowerCase() : '';
    if (rawPriority.includes('crit') || rawPriority.includes('p1')) priority = 'Critical';
    else if (rawPriority.includes('high') || rawPriority.includes('p2')) priority = 'High';
    else if (rawPriority.includes('low') || rawPriority.includes('p4')) priority = 'Low';
    else if (rawPriority.includes('med') || rawPriority.includes('p3')) priority = 'Medium';

    // Normalize status
    let status: TicketStatus = 'Open';
    const rawStatus = statusCol >= 0 ? row[statusCol]?.trim().toLowerCase() : '';
    if (rawStatus.includes('resolv') || rawStatus.includes('closed')) status = 'Resolved';
    else if (rawStatus.includes('prog') || rawStatus.includes('investig')) status = 'In-Progress';
    else if (rawStatus.includes('escala') || rawStatus.includes('tier')) status = 'Escalated';
    else status = 'Open';

    // Normalize category
    let category: TicketCategory = 'Network';
    const rawCat = categoryCol >= 0 ? row[categoryCol]?.trim().toLowerCase() : '';
    if (rawCat.includes('hard') || rawCat.includes('server') || rawCat.includes('workstation')) category = 'Hardware';
    else if (rawCat.includes('sec') || rawCat.includes('auth') || rawCat.includes('access') || rawCat.includes('mfa')) category = 'Access/Security';
    else if (rawCat.includes('bus') || rawCat.includes('db') || rawCat.includes('erp') || rawCat.includes('app')) category = 'Business Systems';
    else category = 'Network';

    const slaMap: Record<PriorityLevel, number> = {
      'Critical': 30,
      'High': 120,
      'Medium': 480,
      'Low': 1440,
    };

    const slaTarget = slaTargetCol >= 0 && parseInt(row[slaTargetCol], 10) 
      ? parseInt(row[slaTargetCol], 10) 
      : slaMap[priority];

    const ticket: IncidentTicket = {
      id: rawId,
      title: rawTitle || (descCol >= 0 ? row[descCol]?.substring(0, 50) : 'Imported Incident Ticket'),
      assetId: assetIdCol >= 0 && row[assetIdCol]?.trim() ? row[assetIdCol].trim() : 'AST-SRV-001',
      assetName: assetNameCol >= 0 && row[assetNameCol]?.trim() ? row[assetNameCol].trim() : 'Imported Infrastructure Asset',
      priority,
      status,
      category,
      createdAt: createdCol >= 0 && row[createdCol]?.trim() ? row[createdCol].trim() : new Date().toISOString(),
      slaTargetMinutes: slaTarget,
      firstResponseMinutes: status === 'Resolved' ? Math.floor(slaTarget * 0.5) : null,
      resolvedAt: status === 'Resolved' ? new Date().toISOString() : null,
      assignedTo: assignedCol >= 0 && row[assignedCol]?.trim() ? row[assignedCol].trim() : 'Alex Rivera',
      department: deptCol >= 0 && row[deptCol]?.trim() ? row[deptCol].trim() : 'IT Operations',
      description: descCol >= 0 && row[descCol]?.trim() ? row[descCol].trim() : (rawTitle || 'No description provided in CSV.'),
      rootCause: rootCauseCol >= 0 && row[rootCauseCol]?.trim() ? row[rootCauseCol].trim() : undefined,
      resolutionNotes: notesCol >= 0 && row[notesCol]?.trim() ? row[notesCol].trim() : undefined,
      activityLog: [
        {
          id: `act-${Date.now()}-${r}`,
          timestamp: new Date().toISOString(),
          author: 'System (CSV Import)',
          action: 'Record Imported',
          note: `Imported via client-side CSV ledger drag & drop.`,
        },
      ],
    };

    tickets.push(ticket);
  }

  return { tickets, errors };
}
