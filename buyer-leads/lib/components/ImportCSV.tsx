"use client";

import Papa from "papaparse";
import { useState } from "react";

export default function ImportCSV() {
  const [error, setError] = useState<string | null>(null);
  const [rowErrors, setRowErrors] = useState<Array<{ row: number; message: string }>>([]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        try {
          const res = await fetch("/api/buyers/import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ records: results.data }),
          });
          if (!res.ok) throw new Error("Import failed");
          const data = await res.json();
          setRowErrors(data.errors || []);
          alert(`Imported ${data.inserted} rows. ${data.errors?.length || 0} errors.`);
        } catch (err: any) {
          setError(err.message);
        }
      },
    });
  };

  return (
    <div className="mt-4">
      <input type="file" accept=".csv" onChange={handleFile} />
      {error && <p className="text-red-600">{error}</p>}
      {rowErrors.length > 0 && (
        <div className="mt-2">
          <div className="text-sm font-semibold">Row Errors:</div>
          <ul className="list-disc ml-6 text-sm text-red-700">
            {rowErrors.map((e) => (
              <li key={`${e.row}-${e.message}`}>Row {e.row}: {e.message}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
