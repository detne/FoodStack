/**
 * ImportMenuDialog
 * Import menu items from Excel (.xlsx, .xls) or CSV file.
 * Parses file client-side, previews rows, then POSTs JSON to /menu-items/import.
 */

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/components/ui/use-toast';
import { apiClient } from '@/lib/api-client';
import {
  Upload,
  Download,
  FileSpreadsheet,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface ParsedRow {
  name: string;
  description?: string;
  price: string | number;
  category: string;
  imageUrl?: string;
  available?: string;
}

interface RowError {
  row: number;
  message: string;
}

interface ImportResult {
  total: number;
  succeeded: number;
  failed: number;
  errors: RowError[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// ── CSV parser (no deps) ──────────────────────────────────────────────────────

function parseCSV(text: string): ParsedRow[] {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());

  const rows: ParsedRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple CSV split (handles quoted fields)
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === ',' && !inQuotes) { values.push(current.trim()); current = ''; continue; }
      current += ch;
    }
    values.push(current.trim());

    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = values[idx] ?? ''; });

    rows.push({
      name: row['name'] ?? '',
      description: row['description'] ?? '',
      price: row['price'] ?? '',
      category: row['category'] ?? '',
      imageUrl: row['imageurl'] ?? row['image_url'] ?? '',
      available: row['available'] ?? row['status'] ?? '',
    });
  }
  return rows;
}

// ── XLSX parser via dynamic import (SheetJS) ─────────────────────────────────

async function parseXLSX(buffer: ArrayBuffer): Promise<ParsedRow[]> {
  // Dynamic import — works if xlsx is installed (added to package.json)
  // Falls back gracefully if not available
  let XLSX: any;
  try {
    // @ts-expect-error xlsx may not be installed yet — run: npm install xlsx
    XLSX = await import('xlsx');
  } catch {
    throw new Error('xlsx library not available. Please use CSV format instead.');
  }

  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const raw: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  return raw.map(r => {
    // Normalise header names (case-insensitive)
    const get = (...keys: string[]) => {
      for (const k of keys) {
        const found = Object.keys(r).find(rk => rk.trim().toLowerCase() === k.toLowerCase());
        if (found !== undefined) return String(r[found] ?? '');
      }
      return '';
    };
    return {
      name: get('name'),
      description: get('description'),
      price: get('price'),
      category: get('category'),
      imageUrl: get('imageUrl', 'imageurl', 'image_url'),
      available: get('available', 'status'),
    };
  });
}

// ── Template download ─────────────────────────────────────────────────────────

function downloadTemplate() {
  const header = 'name,description,price,category,imageUrl,available';
  const example1 = 'Phở Bò,"Phở bò truyền thống, nước dùng đậm đà",85000,Phở,,true';
  const example2 = 'Bún Bò Huế,"Bún bò cay đặc trưng Huế",75000,Bún,,true';
  const csv = [header, example1, example2].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'menu_import_template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ImportMenuDialog({ isOpen, onClose, onSuccess }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [parseError, setParseError] = useState('');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const reset = () => {
    setFileName('');
    setRows([]);
    setParseError('');
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParseError('');
    setRows([]);
    setResult(null);
    setFileName(file.name);

    const ext = file.name.split('.').pop()?.toLowerCase();
    const allowed = ['csv', 'xlsx', 'xls'];
    if (!ext || !allowed.includes(ext)) {
      setParseError('Unsupported file type. Please use .csv, .xlsx, or .xls');
      return;
    }

    try {
      let parsed: ParsedRow[] = [];

      if (ext === 'csv') {
        const text = await file.text();
        parsed = parseCSV(text);
      } else {
        const buffer = await file.arrayBuffer();
        parsed = await parseXLSX(buffer);
      }

      if (parsed.length === 0) {
        setParseError('No data rows found. Make sure the file has a header row and at least one data row.');
        return;
      }
      if (parsed.length > 500) {
        setParseError('Maximum 500 rows per import. Please split your file.');
        return;
      }

      setRows(parsed);
    } catch (err: any) {
      setParseError(err.message || 'Failed to parse file');
    }
  };

  const handleImport = async () => {
    if (rows.length === 0) return;
    setImporting(true);
    setResult(null);

    try {
      const response = await apiClient.importMenuItems(rows as any[]);
      const data = (response as any).data ?? response;

      setResult({
        total: data.total,
        succeeded: data.succeeded,
        failed: data.failed,
        errors: data.errors ?? [],
      });

      if (data.failed === 0) {
        toast({ title: 'Import successful', description: `${data.succeeded} items imported.` });
        onSuccess();
      } else if (data.succeeded > 0) {
        toast({
          title: 'Partial import',
          description: `${data.succeeded} succeeded, ${data.failed} failed.`,
          variant: 'destructive',
        });
        onSuccess();
      } else {
        toast({ title: 'Import failed', description: 'All rows failed. See errors below.', variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Import failed', variant: 'destructive' });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-orange-600" />
            Import Menu Items
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-auto pr-1">
          <div className="space-y-5 pb-2">

            {/* Format description */}
            <div className="rounded-lg border bg-muted/40 p-4 text-sm space-y-2">
              <p className="font-medium">Supported formats: .csv, .xlsx, .xls</p>
              <p className="text-muted-foreground">
                Required columns: <code className="bg-muted px-1 rounded">name</code>,{' '}
                <code className="bg-muted px-1 rounded">price</code>,{' '}
                <code className="bg-muted px-1 rounded">category</code>
              </p>
              <p className="text-muted-foreground">
                Optional: <code className="bg-muted px-1 rounded">description</code>,{' '}
                <code className="bg-muted px-1 rounded">imageUrl</code>,{' '}
                <code className="bg-muted px-1 rounded">available</code> (true/false)
              </p>
              <p className="text-muted-foreground text-xs">
                If a category doesn't exist it will be created automatically.
              </p>
            </div>

            {/* Download template */}
            <Button variant="outline" size="sm" className="gap-2 w-full" onClick={downloadTemplate}>
              <Download className="w-4 h-4" />
              Download Template (CSV)
            </Button>

            {/* File picker */}
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/30 dark:hover:bg-orange-900/10 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              {fileName ? (
                <div className="flex items-center justify-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium">{fileName}</span>
                  <button
                    onClick={e => { e.stopPropagation(); reset(); }}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Click to select file or drag & drop
                </p>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Parse error */}
            {parseError && (
              <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{parseError}</span>
              </div>
            )}

            {/* Preview */}
            {rows.length > 0 && !result && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{rows.length} rows ready to import</p>
                  <Badge variant="secondary">{rows.length} rows</Badge>
                </div>
                <div className="rounded-lg border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/60">
                        <tr>
                          {['#', 'name', 'price', 'category', 'description', 'available'].map(h => (
                            <th key={h} className="px-3 py-2 text-left font-medium text-muted-foreground">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.slice(0, 10).map((row, i) => (
                          <tr key={i} className="border-t hover:bg-muted/30">
                            <td className="px-3 py-1.5 text-muted-foreground">{i + 2}</td>
                            <td className="px-3 py-1.5 font-medium max-w-[120px] truncate">{row.name || <span className="text-destructive">—</span>}</td>
                            <td className="px-3 py-1.5">{row.price || <span className="text-destructive">—</span>}</td>
                            <td className="px-3 py-1.5 max-w-[100px] truncate">{row.category || <span className="text-destructive">—</span>}</td>
                            <td className="px-3 py-1.5 max-w-[120px] truncate text-muted-foreground">{row.description || '—'}</td>
                            <td className="px-3 py-1.5">{row.available || 'true'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {rows.length > 10 && (
                    <p className="text-xs text-muted-foreground text-center py-2 border-t">
                      ... and {rows.length - 10} more rows
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Result */}
            {result && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-2xl font-bold">{result.total}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-900/20 p-3 text-center">
                    <p className="text-2xl font-bold text-green-600">{result.succeeded}</p>
                    <p className="text-xs text-muted-foreground">Succeeded</p>
                  </div>
                  <div className={`rounded-lg border p-3 text-center ${result.failed > 0 ? 'border-red-200 bg-red-50 dark:bg-red-900/20' : ''}`}>
                    <p className={`text-2xl font-bold ${result.failed > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>{result.failed}</p>
                    <p className="text-xs text-muted-foreground">Failed</p>
                  </div>
                </div>

                {result.errors.length > 0 && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 space-y-1.5">
                    <p className="text-sm font-medium text-destructive flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> Row errors
                    </p>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {result.errors.map((e, i) => (
                        <p key={i} className="text-xs text-muted-foreground">
                          <span className="font-medium text-destructive">Row {e.row}:</span> {e.message}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {result.failed === 0 && (
                  <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                    <CheckCircle2 className="w-4 h-4" />
                    All {result.succeeded} items imported successfully!
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t mt-2">
          <Button variant="outline" onClick={handleClose} disabled={importing}>
            {result ? 'Close' : 'Cancel'}
          </Button>
          {!result && (
            <Button
              className="bg-orange-600 hover:bg-orange-700 gap-2"
              onClick={handleImport}
              disabled={rows.length === 0 || importing || !!parseError}
            >
              {importing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Importing...</>
              ) : (
                <><Upload className="w-4 h-4" /> Import {rows.length > 0 ? `(${rows.length})` : ''}</>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
