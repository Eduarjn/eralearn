import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const dataDir = process.env.CERT_DATA_DIR || './data';
    const indexPath = path.join(dataDir, 'manifests', 'index.jsonl');
    
    try {
      const content = await fs.readFile(indexPath, 'utf8');
      const lines = content.trim().split('\n').filter(line => line.trim());
      
      const certificates = lines.map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      }).filter(Boolean);
      
      return NextResponse.json({
        certificates,
        total: certificates.length
      });
    } catch (error) {
      // Arquivo não existe ou está vazio
      return NextResponse.json({
        certificates: [],
        total: 0
      });
    }
    
  } catch (error) {
    console.error('Erro ao buscar índice de certificados:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}






