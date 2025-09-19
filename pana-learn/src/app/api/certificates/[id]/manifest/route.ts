import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getManifestPath, type CertificateManifest } from '@/utils/certificateUtils';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID do certificado é obrigatório' },
        { status: 400 }
      );
    }
    
    // Buscar manifesto em todas as pastas de data
    const dataDir = process.env.CERT_DATA_DIR || './data';
    const manifestsDir = path.join(dataDir, 'manifests');
    
    // Procurar em todas as subpastas YYYY/MM
    const years = await fs.readdir(manifestsDir).catch(() => []);
    
    for (const year of years) {
      if (year.match(/^\d{4}$/)) {
        const yearPath = path.join(manifestsDir, year);
        const months = await fs.readdir(yearPath).catch(() => []);
        
        for (const month of months) {
          if (month.match(/^\d{2}$/)) {
            const manifestPath = path.join(yearPath, month, `${id}.json`);
            
            try {
              const manifestContent = await fs.readFile(manifestPath, 'utf8');
              const manifest: CertificateManifest = JSON.parse(manifestContent);
              
              return NextResponse.json(manifest);
            } catch {
              // Manifesto não encontrado nesta pasta, continuar procurando
              continue;
            }
          }
        }
      }
    }
    
    return NextResponse.json(
      { error: 'Certificado não encontrado' },
      { status: 404 }
    );
    
  } catch (error) {
    console.error('Erro ao buscar manifesto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
















