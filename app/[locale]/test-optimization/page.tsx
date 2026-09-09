"use client";

import { useState } from "react";
import { optimizeImage } from "@/lib/imageOptimization";

export default function TestOptimizationPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    setLoading(true);
    const newResults = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const start = Date.now();
      
      try {
        const optimized = await optimizeImage(file);
        
        newResults.push({
          name: file.name,
          originalSize: (file.size / 1024).toFixed(2) + " KB",
          optimizedSize: (optimized.size / 1024).toFixed(2) + " KB",
          reduction: ((1 - optimized.size / file.size) * 100).toFixed(2) + "%",
          time: Date.now() - start + " ms",
          type: optimized.type
        });
      } catch (err: any) {
        newResults.push({ name: file.name, error: err.message });
      }
    }

    setResults(newResults);
    setLoading(false);
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Test Image Optimization</h1>
      
      <input 
        type="file" 
        multiple 
        onChange={handleFile} 
        className="mb-4 block w-full border p-2 rounded"
      />
      
      {loading && <p>Optimizing images...</p>}
      
      <div className="space-y-4">
        {results.map((r, i) => (
          <div key={i} className="p-4 border rounded shadow">
            {r.error ? (
              <p className="text-red-500">Error: {r.error}</p>
            ) : (
              <ul className="list-disc pl-5">
                <li><strong>Name:</strong> {r.name}</li>
                <li><strong>Original Size:</strong> {r.originalSize}</li>
                <li><strong>Optimized Size:</strong> {r.optimizedSize}</li>
                <li><strong>Reduction:</strong> {r.reduction}</li>
                <li><strong>Type:</strong> {r.type}</li>
                <li><strong>Time:</strong> {r.time}</li>
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
